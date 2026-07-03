import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

export default function AuthCallback() {
  const { user } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  const oauthError = new URLSearchParams(window.location.search).get('error_description');

  useEffect(() => {
    if (user) window.location.replace('/');
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const failed = !!oauthError || timedOut;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="flex flex-col items-center gap-3 text-center max-w-xs">
        {failed ? (
          <>
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-sm text-slate-700 font-medium">
              {oauthError ?? 'No se pudo completar el inicio de sesión con Google.'}
            </p>
          </>
        ) : (
          <>
            <Loader2 className="w-6 h-6 text-[#6366F1] animate-spin" />
            <p className="text-sm text-slate-500">Completando inicio de sesión...</p>
          </>
        )}
        <a href="/" className="text-sm text-[#6366F1] font-medium hover:underline">
          Volver al inicio de sesión
        </a>
      </div>
    </div>
  );
}
