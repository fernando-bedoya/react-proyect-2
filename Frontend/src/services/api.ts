// Simple API helper and base URL configuration
// Uses Vite env var VITE_API_BASE_URL if available, otherwise falls back to localhost:5000
const meta: any = (typeof import.meta !== 'undefined' ? import.meta : {});
const BASE_URL = (meta.env && meta.env.VITE_API_BASE_URL) || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export function getBaseUrl() {
  return BASE_URL.replace(/\/+$/, '');
}

export async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok) {
    let body: any = null;
    try {
      if (contentType.includes('application/json')) body = await res.json();
      else body = await res.text();
    } catch (err) {
      body = { message: 'Unable to parse error body' };
    }
    const error: any = new Error(body?.message || res.statusText || 'Request failed');
    error.status = res.status;
    error.body = body;
    throw error;
  }

  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export default {
  getBaseUrl,
  fetchJson,
};
