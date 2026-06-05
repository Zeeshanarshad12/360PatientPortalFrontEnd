export const CONSENT_COUNT_UPDATED_EVENT = 'consentCountUpdated';

export const isConsentFormsEnabledForPractice = (
  practiceId: string | null | undefined
): boolean => {
  const isProd = process.env.NEXT_PUBLIC_NODE_ENV === 'PRODUCTION';
  if (!isProd) return true;
  return practiceId === '92426';
};

export const applyPendingConsentFormCount = (
  count: number,
  setPendingCount: (count: number) => void
): void => {
  const safeCount = Math.max(0, Number.isFinite(count) ? count : 0);
  setPendingCount(safeCount);
  if (typeof window !== 'undefined') {
    localStorage.setItem('pendingConsentFormCount', String(safeCount));
  }
};

export const notifyConsentCountUpdated = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CONSENT_COUNT_UPDATED_EVENT));
  }
};

export const syncPendingConsentFormCount = (
  count: number,
  setPendingCount: (count: number) => void
): void => {
  applyPendingConsentFormCount(count, setPendingCount);
  notifyConsentCountUpdated();
};
