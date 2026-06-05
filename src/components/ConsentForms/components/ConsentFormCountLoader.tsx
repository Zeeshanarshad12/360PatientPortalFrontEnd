'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from '@/store';
import { GetConsentFormData } from '@/slices/patientprofileslice';
import { useConsentFormContext } from '@/contexts/ConsentFormContext';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import {
  applyPendingConsentFormCount,
  isConsentFormsEnabledForPractice
} from '@/utils/consentFormCountUtils';
import { useRouter } from 'next/router';

const ConsentFormCountLoader = () => {
  const dispatch = useDispatch();
  const { setPendingCount } = useConsentFormContext();
  const { patientId, practiceId } = useCurrentPatient();
  const router = useRouter();

  const setPendingCountRef = useRef(setPendingCount);
  setPendingCountRef.current = setPendingCount;

  const isFetchingRef = useRef(false);

  const lastFetchedPatientIdRef = useRef<string | null>(null);

  const requestIdRef = useRef(0);

  const resolvePatientId = useCallback((): string | null => {
    if (patientId) return patientId;
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('PatientId');
  }, [patientId]);

  const resolvePracticeId = useCallback((): string | null => {
    if (practiceId) return practiceId;
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('PracticeId');
  }, [practiceId]);

  const isConsentFormsPage = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return router.pathname?.includes('consentforms') ?? false;
  }, [router.pathname]);

  const loadPendingCount = useCallback(
    async (options?: { force?: boolean }) => {
      if (typeof window === 'undefined') return;

      if (isConsentFormsPage()) return;

      const token = localStorage.getItem('token');
      if (!token) return;

      const resolvedPatientId = resolvePatientId();
      if (!resolvedPatientId) return;

      const resolvedPracticeId = resolvePracticeId();
      if (!isConsentFormsEnabledForPractice(resolvedPracticeId)) {
        applyPendingConsentFormCount(0, setPendingCountRef.current);
        return;
      }

      if (
        !options?.force &&
        lastFetchedPatientIdRef.current === resolvedPatientId
      ) {
        return;
      }

      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      const currentRequestId = ++requestIdRef.current;

      try {
        const response = await dispatch(
          GetConsentFormData(resolvedPatientId)
        ).unwrap();

        if (currentRequestId !== requestIdRef.current) return;

        const rows = Array.isArray(response?.result) ? response.result : [];
        const pendingCount = rows.filter(
          (form: { status?: string }) => form?.status === 'Pending'
        ).length;

        lastFetchedPatientIdRef.current = resolvedPatientId;

        applyPendingConsentFormCount(pendingCount, setPendingCountRef.current);
      } catch {
        if (currentRequestId !== requestIdRef.current) return;
      } finally {
        isFetchingRef.current = false;
      }
    },

    [dispatch, resolvePatientId, resolvePracticeId, isConsentFormsPage]
  );

  const loadPendingCountRef = useRef(loadPendingCount);
  loadPendingCountRef.current = loadPendingCount;

  useEffect(() => {
    loadPendingCountRef.current({ force: true });
  }, [patientId, practiceId]);

  useEffect(() => {
    const handleRefresh = () => {
      lastFetchedPatientIdRef.current = null;
      loadPendingCountRef.current({ force: true });
    };

    window.addEventListener('practiceInitialized', handleRefresh);
    window.addEventListener('practiceChanged', handleRefresh);
    window.addEventListener('userLoggedIn', handleRefresh);

    return () => {
      window.removeEventListener('practiceInitialized', handleRefresh);
      window.removeEventListener('practiceChanged', handleRefresh);
      window.removeEventListener('userLoggedIn', handleRefresh);
    };
  }, []);

  return null;
};

export default ConsentFormCountLoader;
