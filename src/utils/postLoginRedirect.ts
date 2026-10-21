/**
 * Where to go after signing in, when a signed-out patient opened a protected page directly —
 * e.g. the intake form link their practice sent (/patientportal/intake/<token>). Kept in
 * sessionStorage (this tab only) and used once.
 *
 * Only same-site portal paths are accepted, so the stored value can never send the patient to
 * another site ("//evil.example", "https://…") after sign-in.
 */
const KEY = 'postLoginRedirect';
const MAX_AGE_MS = 30 * 60 * 1000;

function isSafePortalPath(path: unknown): path is string {
  return typeof path === 'string' && path.startsWith('/patientportal/') && !path.startsWith('//') && !path.includes('\\') && path.length <= 500;
}

export function rememberPostLoginRedirect(path: string): void {
  if (typeof window === 'undefined' || !isSafePortalPath(path) || path.startsWith('/patientportal/dashboard')) return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ path, at: Date.now() }));
  } catch {
    // Storage unavailable — the patient simply lands on the dashboard.
  }
}

/** Returns the remembered path (and forgets it), or null. */
export function takePostLoginRedirect(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (!raw) return null;
    const { path, at } = JSON.parse(raw) as { path?: unknown; at?: number };
    return isSafePortalPath(path) && typeof at === 'number' && Date.now() - at < MAX_AGE_MS ? path : null;
  } catch {
    return null;
  }
}
