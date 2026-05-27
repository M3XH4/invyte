import { API_BASE_URL, apiClient } from '@/api/axios';

function apiOrigin() {
  return String(apiClient.defaults.baseURL || API_BASE_URL).replace(/\/api\/?$/, '');
}

export function resolveMediaUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return null;

  if (/^https?:\/\//i.test(pathOrUrl) || pathOrUrl.startsWith('file:')) {
    return pathOrUrl;
  }

  const value = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  if (value.startsWith('/storage/')) return `${apiOrigin()}${value}`;

  return `${apiOrigin()}${value}`;
}

export function withCacheBust(url?: string | null) {
  const resolved = resolveMediaUrl(url);
  if (!resolved || resolved.startsWith('file:')) return resolved;
  const separator = resolved.includes('?') ? '&' : '?';
  return `${resolved}${separator}v=${Date.now()}`;
}
