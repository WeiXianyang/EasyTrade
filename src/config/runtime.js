export function getRuntimeEnv() {
  return import.meta.env || {};
}

export function normalizeBasePath(path = '') {
  const rawPath = String(path || '').trim();
  if (!rawPath || rawPath === '/') {
    return '';
  }
  return `/${rawPath.replace(/^\/+|\/+$/g, '')}`;
}

export function getAppBasePath(env = getRuntimeEnv()) {
  return normalizeBasePath(env.VITE_APP_BASE_PATH);
}

export function withAppBasePath(path, env = getRuntimeEnv()) {
  const basePath = getAppBasePath(env);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}
