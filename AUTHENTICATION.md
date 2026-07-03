# Autenticación

ShiftAI usa **Supabase Auth** como único emisor de sesiones. El backend nunca genera
tokens propios: siempre delega en Supabase (por contraseña o por Google) y luego se
limita a **verificar** el JWT que Supabase firmó. Esto es clave para entender por qué
agregar un proveedor nuevo (Google) no requirió tocar el backend — ver la sección
["Por qué el backend no cambia entre proveedores"](#por-qué-el-backend-no-cambia-entre-proveedores).

Hay dos formas de iniciar sesión:

1. **Email + contraseña** — el frontend llama a la API de ShiftAI, que a su vez llama a Supabase.
2. **Google OAuth** — el navegador habla directo con Google y Supabase; el backend de ShiftAI no participa en ese intercambio.

## Arquitectura general

```
                    ┌─────────────────────┐
                    │   Supabase Auth      │
                    │ (emite y firma JWTs)  │
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                        │
 signInWithPassword     signInWithOAuth('google')   /.well-known/jwks.json
        │                      │                        │
┌───────▼────────┐    ┌────────▼─────────┐    ┌─────────▼─────────┐
│  Backend        │    │  Frontend         │    │  Backend            │
│  (Express)      │    │  (navegador,      │    │  requireAuth        │
│  auth.service.ts│    │  @supabase/       │    │  verifica firma     │
│                 │    │  supabase-js)     │    │  con jose           │
└─────────────────┘    └───────────────────┘    └─────────────────────┘
```

- El backend tiene **dos** clientes de Supabase distintos (`server/src/config/supabase.ts`):
  - `getSupabase()` → cliente admin (service role / `SUPABASE_SECRET_KEY`). Bypasea RLS. Se usa para acceso a datos (`hiring.repository.ts`, etc.), **nunca** para flujos de usuario.
  - `getSupabaseAuth()` → cliente con la *publishable key*. Se usa solo para `signInWithPassword` en el login por contraseña.
- El frontend tiene **un** cliente de Supabase (`ShiftAI/src/lib/supabase.ts`), con la publishable key, usado **solo** para disparar el redirect de Google OAuth y recibir el evento `SIGNED_IN` cuando vuelve. No se usa para nada más (ni para leer datos, ni para el login por contraseña).

## Backend (`server/`)

### Variables de entorno (`server/.env`, ver `.env.example`)

| Variable | Uso |
|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SECRET_KEY` | Cliente admin (`getSupabase()`), bypasea RLS |
| `SUPABASE_PUBLISHABLE_KEY` | Cliente de auth (`getSupabaseAuth()`) y header `apikey` al llamar `/auth/v1/logout` |
| `SUPABASE_JWKS_URL` | Endpoint JWKS del proyecto, usado por `requireAuth` para verificar firmas |

### Archivos

- `server/src/config/supabase.ts` — `getSupabase()` y `getSupabaseAuth()`, ambos *lazy singletons*.
- `server/src/modules/auth/auth.types.ts` — `LoginSchema` (zod), `AuthUser`, `AuthSession`, `LoginResult`.
- `server/src/modules/auth/auth.service.ts`
  - `login({email, password})` → `getSupabaseAuth().auth.signInWithPassword(...)`. Si falla, lanza `HttpError(401, ...)`.
  - `logout(accessToken)` → `POST {SUPABASE_URL}/auth/v1/logout?scope=local` con el token del usuario. Funciona para cualquier proveedor (no distingue password vs Google).
- `server/src/modules/auth/auth.controller.ts` — adapta request/response para `login`, `logout`, `me`.
- `server/src/modules/auth/auth.router.ts` — define las rutas (ver tabla abajo).
- `server/src/middlewares/auth.ts` (`requireAuth`)
  - Lee `Authorization: Bearer <token>`.
  - Verifica la firma con `jwtVerify(token, jwks)` (librería `jose`), usando un `createRemoteJWKSet` cacheado contra `SUPABASE_JWKS_URL`.
  - Si es válido, agrega `req.user = { id, email, role }` (extraídos de los claims `sub`, `email`, `role` del JWT).
  - **No hace ninguna llamada de red a Supabase por request** — la verificación es puramente criptográfica y local, por eso es rápida y no le importa qué proveedor emitió el token.
- `server/src/utils/httpError.ts` — `HttpError(statusCode, message)`.
- `server/src/middlewares/errorHandler.ts` — traduce `HttpError` → `{status, error}`, `ZodError` → 400, y credenciales de Supabase faltantes → 503.
- `server/src/types/express.d.ts` — declara `Request.user?: AuthUser`.

### Endpoints (`/api/v1/auth`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/auth/login` | — | `{email, password}` → `{user, session}`. Solo aplica al login por contraseña; Google nunca llega aquí. |
| `POST` | `/auth/logout` | `requireAuth` | Revoca la sesión actual en Supabase. Funciona para password o Google. |
| `GET` | `/auth/me` | `requireAuth` | Devuelve `{user}` a partir del JWT verificado. |

Todas las rutas de escritura pasan por `writeLimiter` (rate limit).

## Frontend (`ShiftAI/`)

### Variables de entorno (`ShiftAI/.env`, ver `.env.example`)

| Variable | Uso |
|---|---|
| `VITE_API_URL` | Base URL de la API de ShiftAI (`http://localhost:3000/api/v1` en dev) |
| `VITE_SUPABASE_URL` | Mismo proyecto Supabase que el backend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Cliente de Supabase del navegador — segura de exponer, es pública por diseño |

`ShiftAI/.env` y `.env.local` están en `.gitignore`.

### Archivos

- `src/lib/supabase.ts` — cliente Supabase del navegador, solo para OAuth.
- `src/api/types.ts` — `AuthUser`, `AuthSession`, `LoginResult` (mismo shape que el backend).
- `src/api/session.ts` — helpers de `localStorage` bajo la key `shiftai.session`: `readStoredSession`, `writeStoredSession`, `clearStoredSession`.
- `src/api/client.ts` — instancia de **axios** (`apiClient`):
  - Interceptor de request: si hay sesión guardada, agrega `Authorization: Bearer <access_token>` automáticamente.
  - Interceptor de response: si el backend responde con `{error: "..."}`, lo convierte en un `Error` normal con ese mensaje (así el resto del código no sabe que existe axios).
- `src/api/auth.ts` — `login()`, `logout()`, `me()`, llaman a `apiClient` contra los endpoints del backend. Ninguna de estas funciones recibe el token como parámetro — lo toma el interceptor.
- `src/context/auth-context.ts` — definición de `AuthContext` y el tipo `AuthContextValue`.
- `src/context/AuthContext.tsx` (`AuthProvider`) — el corazón del estado de auth, construido sobre **TanStack Query**:
  - `useQuery(['auth', 'session'])` — al montar, si hay sesión en `localStorage`, llama a `authApi.me()` para validarla contra el backend. `enabled: !!readStoredSession()` evita el flash de loading cuando no hay sesión.
  - `useMutation` para `login` — al tener éxito, escribe la sesión en `localStorage` y la mete directo en la cache de la query (`setQueryData`), sin esperar un refetch.
  - `useMutation` para `logout` — llama a `authApi.logout()` **y** `supabase.auth.signOut()` en paralelo (`Promise.allSettled`), y limpia todo al terminar.
  - `useEffect` con `supabase.auth.onAuthStateChange(...)` — este es el puente para Google: cuando el cliente de Supabase del navegador detecta un `SIGNED_IN` (porque volvimos del redirect de Google), toma esa sesión, la guarda con el mismo `writeStoredSession` que usa el login por contraseña, y llama a `authApi.me()` para poblar la cache. **A partir de aquí, el resto de la app no distingue cómo se autenticó el usuario.**
  - `loginWithGoogle()` → `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/auth/callback' } })`. Esto navega el navegador fuera de la app.
- `src/context/useAuth.ts` — hook `useAuth()` que expone `{ user, accessToken, loading, error, login, loginWithGoogle, logout }`.
- `src/modules/auth/LoginView.tsx` — UI de login: botón "Continuar con Google" + formulario de email/contraseña.
- `src/modules/auth/AuthCallback.tsx` — pantalla mínima montada en `/auth/callback`. Espera a que `user` se popule (vía el listener de arriba) y hace `window.location.replace('/')`. Si la URL trae `error_description` (usuario canceló el consentimiento en Google, por ejemplo) o pasan 8s sin resolver, muestra un mensaje de error con link para volver.
- `src/main.tsx` — sin librería de routing: decide entre `<AuthCallback />` y `<App />` mirando `window.location.pathname` una sola vez al montar. También monta `QueryClientProvider` y el `<Toaster />` de `sileo`.
- `src/App.tsx` — usa `useAuth()`: si `loading` muestra un spinner, si `!user` renderiza `<LoginView />`, si no, la app normal.
- `src/components/Header.tsx` — muestra `user?.email` y el botón "Cerrar Sesión" llama a `logout()`.

### Flujo: login por email/contraseña

1. Usuario llena el formulario en `LoginView` → `login(email, password)`.
2. `AuthContext` dispara `loginMutation` → `authApi.login()` → `POST /api/v1/auth/login`.
3. Backend llama a `getSupabaseAuth().auth.signInWithPassword(...)`.
4. Supabase valida credenciales y devuelve `{user, session}` con un JWT firmado.
5. Backend responde eso tal cual al frontend.
6. Frontend guarda `session` en `localStorage` (`shiftai.session`) y actualiza la cache de React Query → la UI re-renderiza mostrando la app.

### Flujo: login con Google

1. Usuario click en "Continuar con Google" → `loginWithGoogle()`.
2. El cliente Supabase del **navegador** redirige a `https://<proyecto>.supabase.co/auth/v1/authorize?provider=google...`.
3. Supabase redirige a Google. Usuario aprueba el consentimiento.
4. Google redirige a `https://<proyecto>.supabase.co/auth/v1/callback` (configurado en Google Cloud Console — **fijo, no es configurable por app**). Supabase intercambia el código con Google usando el `client_secret` guardado en el dashboard de Supabase.
5. Supabase redirige el navegador a `http://localhost:5173/auth/callback` (nuestro `redirectTo`), con la sesión ya resuelta.
6. `AuthCallback.tsx` se monta. En paralelo, el cliente Supabase del navegador dispara `onAuthStateChange('SIGNED_IN', session)`.
7. El listener en `AuthContext` guarda esa sesión en `localStorage` con el mismo formato que el login por contraseña, y llama a `authApi.me()` contra **nuestro** backend para confirmarla y poblar la cache.
8. `user` se popula → `AuthCallback` hace `window.location.replace('/')` → `App.tsx` ya ve `user` seteado y muestra la app.

**El backend nunca participa en los pasos 2–6.** Solo entra en el paso 7, y ahí hace exactamente lo mismo que en el login por contraseña: verificar un JWT de Supabase.

### Por qué el backend no cambia entre proveedores

`requireAuth` (`server/src/middlewares/auth.ts`) hace una sola cosa:

```ts
const { payload } = await jwtVerify(token, jwks); // ¿firma válida? ¿no expiró?
req.user = { id: payload.sub, email: payload.email, role: payload.role };
```

Un JWT emitido por `signInWithPassword` y uno emitido tras el flujo de Google tienen
**la misma forma** y están firmados con **la misma clave del proyecto** — Supabase es
quien los emite en ambos casos. El único claim que distingue el método es
`app_metadata.provider`, que hoy no se usa. Por eso verificar el token es
indistinguible entre proveedores, y agregar Google no tocó ni una línea del backend.

Si se integrara Google **sin** Supabase de por medio, sí haría falta backend: un
endpoint para recibir el `code` de Google, intercambiarlo con el `client_secret`,
verificar el `id_token` y emitir una sesión propia. Ese trabajo es exactamente lo que
Supabase ya resuelve.

## Configuración manual requerida (Supabase Dashboard)

Esto **no** se puede hacer por API con las keys del proyecto — requiere acceso al dashboard:

1. **Authentication → Sign In / Providers → Google**: pegar el Client ID y Client
   Secret generados en Google Cloud Console, y habilitar el proveedor.
2. **Authentication → URL Configuration → Redirect URLs**: agregar
   `http://localhost:5173/auth/callback` (y el dominio de producción cuando exista).

> ⚠️ No confundir con **Authentication → OAuth Server** — esa sección es para que
> ShiftAI actúe como *proveedor* de identidad para apps de terceros (lo inverso de
> lo que necesitamos). Debe quedar desactivada.

## Seguridad

- El `client_secret` de Google **solo** vive en el dashboard de Supabase. No está en
  ningún `.env`, ni en el backend ni en el frontend — Supabase es quien lo usa
  server-side para hablar con Google.
- `SUPABASE_SECRET_KEY` (service role) solo existe en `server/.env`, nunca se expone
  al frontend. El frontend solo conoce la *publishable key*, diseñada para ser pública.
- La verificación de JWT es local (JWKS cacheado en memoria), sin round-trip a
  Supabase por cada request protegido.
- `server/.env` y `ShiftAI/.env` están en `.gitignore` en ambos workspaces.
