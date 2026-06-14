import axios from 'axios';

import { getRuntimeEnv, normalizeBasePath } from '../config/runtime.js';

export const TOKEN_STORAGE_KEY = 'easytrade.token';
export const USER_STORAGE_KEY = 'easytrade.user';
export const ADMIN_STORAGE_KEY = 'easytrade.admin';

export function resolveApiBaseUrl(env = getRuntimeEnv()) {
  if (env.VITE_API_BASE_URL) {
    return String(env.VITE_API_BASE_URL).replace(/\/+$/g, '');
  }

  const basePath = normalizeBasePath(env.VITE_APP_BASE_PATH);
  return basePath ? `${basePath}/api` : '/api';
}

export function getStoredToken(storage = globalThis.localStorage) {
  return storage?.getItem(TOKEN_STORAGE_KEY) || null;
}

export function storeAuthToken(token, storage = globalThis.localStorage) {
  storage?.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken(storage = globalThis.localStorage) {
  storage?.removeItem(TOKEN_STORAGE_KEY);
}

export function unwrapApiResponse(response) {
  const body = response?.data;
  if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
    return body.data;
  }
  return body;
}

export function handleApiError(error) {
  const status = error.response?.status;

  if (status === 401) {
    clearAuthToken();

    if (typeof window !== 'undefined' && window.location) {
      const basePath = normalizeBasePath(getRuntimeEnv().VITE_APP_BASE_PATH);
      const loginPath = `${basePath}/login`;
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = loginPath;
      }
    }

    return Promise.reject(new Error('登录已过期，请重新登录'));
  }

  if (status === 403) {
    return Promise.reject(new Error('无权限执行该操作'));
  }

  if (status === 404) {
    return Promise.reject(new Error('请求的资源不存在'));
  }

  if (status >= 500) {
    return Promise.reject(new Error('服务器异常，请稍后再试'));
  }

  if (!error.response) {
    return Promise.reject(new Error('网络异常，请检查网络连接'));
  }

  const body = error.response?.data;
  return Promise.reject(new Error(body?.message || error.message || '请求失败'));
}

const request = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: Number(getRuntimeEnv().VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

request.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use(unwrapApiResponse, handleApiError);

export default request;
