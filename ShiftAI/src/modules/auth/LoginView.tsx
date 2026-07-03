import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.92c1.7-1.57 2.68-3.87 2.68-6.64Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.17l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34C2.44 15.98 5.48 18 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.94H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.06l3.01-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

export default function LoginView() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans px-6">
      <div className="w-full max-w-[340px]">
        <div className="w-8 h-8 rounded-[9px] bg-[#0F172A] mx-auto mb-6" />

        <h1 className="text-[26px] font-semibold text-slate-900 tracking-tight text-center leading-tight">
          Iniciar sesión
        </h1>
        <p className="text-[13px] text-slate-500 text-center mt-1.5 mb-8">Usa tu cuenta de ShiftAI.</p>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full py-3 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-[15px] font-medium flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50"
        >
          {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
          Continuar con Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">o</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="w-full border border-slate-300 rounded-xl py-3 px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 transition-shadow"
              required
              autoComplete="email"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full border border-slate-300 rounded-xl py-3 px-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 transition-shadow"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-[13px] text-red-600 text-center pt-3">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#6366F1] hover:bg-[#5457e5] text-white rounded-full text-[15px] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-6"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
