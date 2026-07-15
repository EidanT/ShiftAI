import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sileo';
import App from './App.tsx';
import AuthCallback from './modules/auth/AuthCallback.tsx';
import { AuthProvider } from './context/AuthContext';
import 'sileo/styles.css';
import './index.css';

const queryClient = new QueryClient();
const isAuthCallback = window.location.pathname.startsWith('/auth/callback');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="bottom-right" theme="light" />
        {isAuthCallback ? <AuthCallback /> : <App />}
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
