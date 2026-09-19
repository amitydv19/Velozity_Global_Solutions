import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'https://velozity-global-solutions-1.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

async function refreshAccessToken(): Promise<string | null> {
  const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
  const token = response.data?.data?.accessToken as string | undefined;
  if (token) {
    setAccessToken(token);
    return token;
  }
  return null;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as { _retry?: boolean; headers?: Record<string, string> };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const token = await refreshPromise;
      if (token) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);
