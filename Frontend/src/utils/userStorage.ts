export type AppUser = {
  id?: number | string;
  name?: string | null;
  email?: string | null;
  [k: string]: any;
};

const USER_KEY = 'user';
const USER_EVENT = 'app:userChange';

function safeParse(s: string | null) {
  try {
    return s ? JSON.parse(s) : null;
  } catch (e) {
    console.warn('userStorage: JSON parse error', e);
    return null;
  }
}

function normalizeUser(raw: any): AppUser | null {
  if (!raw) return null;
  if (typeof raw === 'object') {
    const name = raw.name ?? raw.displayName ?? raw.fullName ?? null;
    const id = raw.id ?? raw.uid ?? raw.userId ?? null;
    const email = raw.email ?? null;
    return {
      ...raw,
      name,
      id,
      email,
    } as AppUser;
  }
  return null;
}

function readRaw() {
  return safeParse(localStorage.getItem(USER_KEY));
}

export function getUser(): AppUser | null {
  const raw = readRaw();
  return normalizeUser(raw);
}

export function setUser(user: any): void {
  try {
    const normalized = normalizeUser(user);
    if (normalized) {
      localStorage.setItem(USER_KEY, JSON.stringify(normalized));
    } else {
      localStorage.removeItem(USER_KEY);
    }
    window.dispatchEvent(new CustomEvent(USER_EVENT, { detail: normalized }));
  } catch (e) {
    console.error('userStorage: error saving user', e);
  }
}

export function clearUser(): void {
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new CustomEvent(USER_EVENT, { detail: null }));
}

export function onUserChange(handler: (u: AppUser | null) => void) {
  const storageHandler = (e: StorageEvent) => {
    if (e.key === USER_KEY) {
      handler(normalizeUser(safeParse(e.newValue)));
    }
  };

  const customHandler = (e: Event) => {
    const ce = e as CustomEvent;
    handler(normalizeUser(ce.detail));
  };

  window.addEventListener('storage', storageHandler);
  window.addEventListener(USER_EVENT, customHandler as EventListener);

  return () => {
    window.removeEventListener('storage', storageHandler);
    window.removeEventListener(USER_EVENT, customHandler as EventListener);
  };
}
