export type Role = {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

function getBaseUrl(): string {
  const meta: any = (typeof import.meta !== 'undefined' ? import.meta : {});
  return (meta.env && meta.env.VITE_API_BASE_URL) || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
}

async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  if (!res.ok) {
    let body: any = null;
    try { body = await res.json(); } catch (_) { body = await res.text(); }
    const err: any = new Error(body?.message || res.statusText || 'Request failed');
    err.status = res.status; err.body = body;
    throw err;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export async function getRoles(): Promise<Role[]> {
  const url = `${getBaseUrl().replace(/\/+$/, '')}/roles`;
  return fetchJson(url) as Promise<Role[]>;
}

export default { getRoles };
