import { useEffect, useState } from 'react';
import type { IntakeSearch } from './types';

const MIN_QUERY = 2;
const DEBOUNCE_MS = 300;

/** Runs `search` 300ms after the patient stops typing (2+ characters); a result that arrives
 * after a newer keystroke is dropped. Every keystroke would otherwise hit the backend (and,
 * for drugs, the practice's eRx vendor). */
export function useDebouncedSearch(query: string, search: IntakeSearch | undefined) {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const q = query.trim();
  const active = Boolean(search) && q.length >= MIN_QUERY;

  useEffect(() => {
    if (!search || q.length < MIN_QUERY) return undefined;
    let stale = false;
    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      search(q)
        .then((r) => {
          if (!stale) setResults(r);
        })
        .catch((err: Error) => {
          if (stale) return;
          setResults([]);
          setError(err?.message || "Search isn't available right now. Please try again.");
        })
        .finally(() => {
          if (!stale) setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [q, search]);

  return { results: active ? results : [], loading: active && loading, error: active ? error : null, tooShort: q.length > 0 && q.length < MIN_QUERY };
}
