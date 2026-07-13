export const VIEW_ONLY_AGENT_USERNAME = 'support_agent';
export const VIEW_ONLY_AGENT_EMAIL = 'support.agent@tercescrow.com';

export const READ_ONLY_SESSION_STORAGE_KEY = 'terescrow-read-only-session';

export type ReadOnlyUserLike = {
  email?: string | null;
  username?: string | null;
  readOnlyMode?: boolean;
};

export function isReadOnlyDemoUser(user: ReadOnlyUserLike | null | undefined): boolean {
  if (!user) return false;
  if (user.readOnlyMode === true) return true;
  const email = (user.email ?? '').trim().toLowerCase();
  const username = (user.username ?? '').trim().toLowerCase();
  return email === VIEW_ONLY_AGENT_EMAIL || username === VIEW_ONLY_AGENT_USERNAME;
}

export function setReadOnlyDemoSession(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  if (enabled) {
    sessionStorage.setItem(READ_ONLY_SESSION_STORAGE_KEY, '1');
  } else {
    sessionStorage.removeItem(READ_ONLY_SESSION_STORAGE_KEY);
  }
}

export function isReadOnlyDemoSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(READ_ONLY_SESSION_STORAGE_KEY) === '1';
}
