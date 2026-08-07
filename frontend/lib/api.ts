import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { BACKEND_URL } from './constants';

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem('auth_token', access);
  localStorage.setItem('refresh_token', refresh);
}

function clearTokens() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const { data } = await axios.post(
      `${BACKEND_URL}/auth/refresh`,
      { refresh_token: refresh },
      { headers: { 'Content-Type': 'application/json' } }
    );
    setTokens(data.access_token, data.refresh_token);
    return data.access_token as string;
  } catch {
    clearTokens();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && original && !original._retry) {
      // Don't try to refresh the refresh endpoint itself
      if (original.url?.includes('/auth/refresh') || original.url?.includes('/auth/login')) {
        clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      original._retry = true;

      // Single-flight refresh
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccess = await refreshPromise;
      if (newAccess) {
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      }

      if (typeof window !== 'undefined') window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export async function serverFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export { api, setTokens, clearTokens, getAccessToken, getRefreshToken };