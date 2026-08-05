import { supabase } from './supabase';

/**
 * A wrapper around the native fetch API that automatically attaches the
 * Supabase JWT session token to the Authorization header.
 * 
 * It points to the Next.js API routes (which are proxied to Express backend).
 */
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  // Ensure the endpoint starts with a slash
  const url = endpoint.startsWith('http') ? endpoint : (endpoint.startsWith('/') ? endpoint : `/${endpoint}`);
  // Read the token from cookies instead of Supabase Auth
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };
  
  const token = getCookie('sb-access-token');
  const headers = new Headers(options.headers);
  
  console.log('[fetchApi] Endpoint:', url, 'Token found:', !!token);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

export const apiClient = {
  get: (endpoint: string, options?: RequestInit) => fetchApi(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, data?: any, options?: RequestInit) => fetchApi(endpoint, { 
    ...options, 
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined 
  }),
  put: (endpoint: string, data?: any, options?: RequestInit) => fetchApi(endpoint, { 
    ...options, 
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined 
  }),
  delete: (endpoint: string, options?: RequestInit) => fetchApi(endpoint, { ...options, method: 'DELETE' }),
  patch: (endpoint: string, data?: any, options?: RequestInit) => fetchApi(endpoint, { 
    ...options, 
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined 
  }),
};
