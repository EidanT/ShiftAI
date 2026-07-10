# ShiftAI Services

Microservicio FastAPI que recibe PDFs de CVs, extrae su contenido a Markdown y produce resúmenes en lenguaje natural usando un LLM agnóstico al proveedor (OpenAI, OpenRouter, LM Studio, Ollama, Anthropic, vLLM, Groq, etc.).

---

## Tabla de contenidos

- [Arquitectura](#arquitectura)
- [Inicio rápido](#inicio-rápido)
- [Variables de entorno (`.env`)](#variables-de-entorno-env)
- [Endpoints disponibles](#endpoints-disponibles)
- [Cómo funciona la inyección de variables](#cómo-funciona-la-inyección-de-variables)
- [Cómo agregar un nuevo caso de uso con IA](#cómo-agregar-un-nuevo-caso-de-uso-con-ia)
- [Estructura de carpetas](#estructura-de-carpetas)

---

## Arquitectura

```
Cliente HTTP
   │
   ▼
┌─────────────────────────────────────────────┐
│  FastAPI (main.py)                          │
│  ─ app.state.provider  (LLMProvider)        │
│  ─ routers /v1/cv/process, /v1/cv/summarize │
└─────────────────────────────────────────────┘
   │                          │
   ▼                          ▼
CVProcessingService       LLMService
(PDF → Markdown)          (Markdown → resumen)
                              │
                              ▼
                      LLMProvider (registry)
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       OpenAICompat     OllamaNative    AnthropicNative
```

El LLM es **agnóstico**: solo necesita `LLM_BASE_URL`, `LLM_API_KEY` y `LLM_MODEL`. El protocolo se autodetecta de la URL (configurable con `LLM_PROVIDER`).

---

## Inicio rápido

```powershell
# 1. Crear entorno virtual
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2. Instalar dependencias
pip install -e .

# 3. Copiar variables de entorno y editar
copy .env_example .env

# 4. Levantar el servicio
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Documentación interactiva: <http://localhost:8001/docs>

---

## Variables de entorno (`.env`)

El archivo `.env` se carga automáticamente por `pydantic-settings`. La convención es **MAYÚSCULAS_CON_GUIONES_BAJOS** en el `.env`, que Pydantic traduce a `snake_case` en Python.

| Variable | Default | Descripción |
|---|---|---|
| `SERVICE_HOST` | `0.0.0.0` | Host de escucha |
| `SERVICE_PORT` | `8000` | Puerto HTTP |
| `SERVICE_LOG_LEVEL` | `INFO` | Nivel de logging |
| `CV_MAX_SIZE_BYTES` | `15728640` | Tamaño máximo del PDF (15 MB) |
| `CV_MAX_PAGES` | `200` | Páginas máximas a procesar |
| `CV_OCR_MIN_CHARS` | `30` | Umbral para activar OCR |
| `CV_OCR_DPI` | `200` | DPI del OCR |
| `CV_REQUEST_TIMEOUT_SECONDS` | `60` | Timeout por request |
| `CV_RATE_LIMIT_PER_MINUTE` | `100` | Rate limit por IP |
| `LLM_PROVIDER` | `auto` | `auto`, `openai_compatible`, `ollama`, `anthropic` |
| `LLM_BASE_URL` | `""` | URL base del proveedor |
| `LLM_API_KEY` | `""` | API key del proveedor |
| `LLM_MODEL` | `""` | Modelo a usar por default |
| `LLM_TEMPERATURE` | `0.2` | Temperatura del LLM |
| `LLM_MAX_TOKENS` | `80000` | Tokens máximos de salida |
| `LLM_TIMEOUT_SECONDS` | `60` | Timeout de la llamada al LLM |

> **Orden de prioridad**: variables de entorno del sistema > `.env` > defaults de la clase.

---

## Endpoints disponibles

| Método | Ruta | Descripción |
|---|---|---|
| `GET`  | `/health` | Liveness probe |
| `POST` | `/v1/cv/process` | PDF → Markdown (sin LLM) |
| `POST` | `/v1/cv/summarize` | PDF → resumen en lenguaje natural |

### Ejemplo: resumir un CV

```bash
curl -X POST http://localhost:8001/v1/cv/summarize \
  -F "file=@cv.pdf"
```

Respuesta:

```json
{
  "filename": "cv.pdf",
  "summary": "Profesional con 8 años de experiencia en...",
  "model": "anthropic/claude-3.5-sonnet",
  "provider": "openai_compatible"
}
```

---

## Cómo funciona la inyección de variables


Para cambiar de proveedor (por ejemplo, de OpenRouter a LM Studio), solo edita `LLM_BASE_URL` en el `.env`. No hace falta tocar código.

---

## Cómo agregar un nuevo caso de uso con IA

Supongamos que queremos un nuevo endpoint `/v1/cv/score` que reciba un PDF y devuelva una **puntuación de 0-100** del candidato.

### 1. Crear el prompt

**Archivo:** `llm/prompts.py`

```python
SYSTEM_SCORE = (
    "Eres un reclutador senior. Recibirás un CV en Markdown y debes "
    "devolver SOLO un número entero entre 0 y 100 que represente la "
    "idoneidad general del candidato para un puesto técnico."
)

def build_score_prompt(markdown: str) -> str:
    return (
        "Evalúa el siguiente CV y responde SOLO con un número del 0 al 100.\n\n"
        f"{markdown}"
    )
```

### 2. Agregar el método al servicio LLM

**Archivo:** `llm/services.py`

```python
from llm.prompts import SYSTEM_SCORE, build_score_prompt

class LLMService:
    # ... __init__ y summarize existentes ...

    async def score(self, markdown: str, *, model: str | None = None) -> ChatResponse:
        chosen_model = model or self._default_model
        if not chosen_model:
            raise LLMUnavailableError("No hay modelo configurado (LLM_MODEL).")

        messages = [
            ChatMessage(role="system", content=SYSTEM_SCORE),
            ChatMessage(role="user", content=build_score_prompt(markdown)),
        ]

        try:
            return await self._provider.chat(
                model=chosen_model,
                messages=messages,
                temperature=self._temperature,
                max_tokens=self._max_tokens,
            )
        except Exception as exc:
            logger.warning("llm.score failed: %s", exc)
            raise LLMUnavailableError("El LLM no respondió.") from exc
```

### 3. Definir el schema de respuesta

**Archivo:** `document_processing/cv/schemas.py`

```python
class CVScoreResult(BaseModel):
    filename: str
    score: int = Field(ge=0, le=100)
    model: str
    provider: str
```

### 4. Crear el router

**Archivo:** `router/v1/cv/score.py`

```python
from fastapi import APIRouter, Depends, File, Request, UploadFile, HTTPException, status
from document_processing.cv.service import CVProcessingService
from document_processing.cv.schemas import CVScoreResult
from llm.services import LLMService
from config.settings import Settings, get_settings

router = APIRouter()

@router.post("/score", response_model=CVScoreResult, summary="Puntúa un CV de 0 a 100.")
async def score_cv(
    request: Request,
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
    service: CVProcessingService = Depends(...),
) -> CVScoreResult:
    processed = await service.process_pdf(file, route="score")
    llm_service = get_llm_service(request=request, settings=settings)
    response = await llm_service.score(processed.markdown)

    # Parsear el número del contenido del LLM
    try:
        score = int(response.content.strip())
    except ValueError:
        score = 0

    return CVScoreResult(
        filename=processed.filename,
        score=score,
        model=response.model,
        provider=response.provider,
    )
```

### 5. Registrar el router en `main.py`

```python
from router.v1.cv.score import router as cv_score_router

app.include_router(cv_score_router, prefix="/v1/cv", tags=["cv"])
```

### 6. (Opcional) Probarlo

```bash
curl -X POST http://localhost:8001/v1/cv/score -F "file=@cv.pdf"
```

```json
{ "filename": "cv.pdf", "score": 78, "model": "...", "provider": "..." }
```


---

## Estructura de carpetas

```
services/
├── main.py                  # Entry point FastAPI
├── registry.py              # Factory de LLMProvider desde Settings
├── config/
│   └── settings.py          # Settings(BaseSettings) + get_settings()
├── providers/               # Adaptadores LLM agnósticos
│   ├── base.py              # LLMProvider abstracto + ChatMessage/ChatResponse
│   ├── openia.py            # OpenAI / OpenRouter / LM Studio / vLLM
│   ├── ollama_native.py     # Ollama nativo
│   ├── anthopic.py          # Anthropic nativo
│   ├── autodetect.py        # Detección de proveedor desde la URL
│   └── specs.py             # Specs de protocolo (endpoints, headers)
├── llm/                     # Capa de aplicación del LLM
│   ├── services.py          # LLMService (métodos de alto nivel)
│   └── prompts.py           # Prompts de sistema y builders
├── document_processing/cv/  # Pipeline PDF → Markdown
│   ├── service.py           # CVProcessingService
│   ├── extractor.py         # Extracción de texto
│   ├── ocr.py               # OCR con Tesseract
│   ├── converter.py         # PDF → Markdown
│   ├── cleaner.py           # null
│   ├── validator.py         # Validaciones
│   ├── schemas.py           # Modelos Pydantic de entrada/salida
│   └── exceptions.py        # Excepciones de dominio
├── router/v1/
│   ├── cv/                  # Endpoints de CV
│   │   ├── api.py
│   │   ├── chat.py
│   │   ├── cv.py
│   │   ├── greet.py
│   │   └── health.py
└── lib/                     # Utilidades compartidas
```
