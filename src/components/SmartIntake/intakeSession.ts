/**
 * The Smart Intake session for a patient who is NOT registered on the portal.
 *
 * After a one-time code is verified, the backend returns a short-lived token that works for that one
 * intake link only (it is not a portal sign-in: no profile, no other pages). It is kept in
 * sessionStorage - this tab only, gone when the tab closes - and never in localStorage, so it can't
 * be mistaken for, or leak into, the portal's own session (`token`, `refresh_token`).
 */
const KEY = 'intakeSession';

interface StoredSession {
  linkToken: string;
  sessionToken: string;
  expiresAt: number;
}

/** A signed-in portal user takes the normal path; the intake session is only for everyone else. */
export const hasPortalSession = (): boolean =>
  typeof window !== 'undefined' && !!localStorage.getItem('token');

export const saveIntakeSession = (linkToken: string, sessionToken: string, expiresInSeconds: number): void => {
  try {
    const value: StoredSession = { linkToken, sessionToken, expiresAt: Date.now() + Math.max(0, expiresInSeconds) * 1000 };
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable: the patient will be asked for a code again on reload.
  }
};

/** The session token for this link, or null when there is none, it is for another link, or it expired. */
export const getIntakeSession = (linkToken: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<StoredSession>;
    if (stored.linkToken !== linkToken || !stored.sessionToken || typeof stored.expiresAt !== 'number' || stored.expiresAt <= Date.now()) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return stored.sessionToken;
  } catch {
    return null;
  }
};

export const clearIntakeSession = (): void => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};

/** Whichever session is stored and still valid (for calls that carry no link token, e.g. the ZIP lookup). */
export const currentIntakeSession = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<StoredSession>;
    return stored.sessionToken && typeof stored.expiresAt === 'number' && stored.expiresAt > Date.now() ? stored.sessionToken : null;
  } catch {
    return null;
  }
};
