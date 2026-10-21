import { useCallback, useEffect, useState } from 'react';

/**
 * Seconds remaining until a deadline. The deadline is derived from a server-supplied duration
 * ("resend available in N seconds") plus the local clock at receipt, so client/server clock skew
 * can't shorten or stretch the countdown.
 */
export const useCountdown = () => {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  const start = useCallback((seconds: number) => {
    const safe = Math.max(0, Math.floor(seconds || 0));
    setDeadline(Date.now() + safe * 1000);
    setRemaining(safe);
  }, []);

  const clear = useCallback(() => {
    setDeadline(null);
    setRemaining(0);
  }, []);

  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) setDeadline(null);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return { remaining, start, clear };
};

export const formatMmSs = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Screen-reader phrasing, e.g. "4 minutes 5 seconds".
export const formatSpoken = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const parts = [];
  if (m) parts.push(`${m} minute${m === 1 ? '' : 's'}`);
  if (s || !m) parts.push(`${s} second${s === 1 ? '' : 's'}`);
  return parts.join(' ');
};
