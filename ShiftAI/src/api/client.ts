import axios, { type AxiosError } from 'axios';
import { readStoredSession } from './session';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use((config) => {
  const token = readStoredSession()?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    const message = error.response?.data?.error ?? 'Ocurrió un error inesperado';
    return Promise.reject(new Error(message));
  },
);
