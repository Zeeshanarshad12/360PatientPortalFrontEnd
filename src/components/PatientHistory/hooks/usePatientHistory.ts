'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from '@/store';
import SnackbarUtils from '@/content/snackbar';
import {
  setActiveSection,
  setPatientContext,
  toggleCondition,
  toggleSurgicalCondition,
  setSurgicalDate,
  selectSmokingStatus,
  toggleFamilyCell,
  addCustomFamilyLookup,
  toggleSocialCondition,
  saveSocialHistory,
  resetSavingStatus,
  resetSectionStatus,
  fetchFamilyRelations,
  fetchSections,
  fetchSectionData,
  saveMedicalHistory,
  saveSurgicalHistory,
  saveFamilyHistory,
  saveSmokingStatus,
  ENABLED_SECTION_IDS
} from '@/slices/patientHistorySlice';

interface ThunkResult {
  meta: { requestStatus: 'fulfilled' | 'rejected' | 'pending' };
}

interface UsePatientHistoryProps {
  patientId: number;
  practiceId: number;
}

// ── Section display names for success messages ────────────────────────────────
const SECTION_NAMES: Record<number, string> = {
  1: 'Medical History',
  2: 'Surgical History',
  3: 'Family History',
  4: 'Smoking Status',
  5: 'Social History'
};

export const usePatientHistory = ({
  patientId,
  practiceId
}: UsePatientHistoryProps) => {
  const dispatch = useDispatch();
  const {
    sections,
    sectionsLoading,
    activeSection,
    data,
    saving,
    familyRelations,
    familyRelationsLoading
  } = useSelector((state) => state.patientHistory);

  // ── Fix 1: refetch trigger — increments to re-run fetchSectionData useEffect
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const sorted = useMemo(
    () => [...ENABLED_SECTION_IDS].sort((a, b) => a - b),
    []
  );
  const isFirstSection = sorted[0] === activeSection;
  const isLastSection = sorted[sorted.length - 1] === activeSection;

  // Bootstrap
  useEffect(() => {
    dispatch(setPatientContext({ patientId, practiceId }));
    dispatch(fetchSections());
    dispatch(fetchFamilyRelations());
  }, [dispatch, patientId, practiceId]);

  // ── Fix 3: Sub-tab data refresh — resets status on every tab switch so
  //    fetchSectionData always runs fresh, not skipped due to 'success' cache
  useEffect(() => {
    if (!ENABLED_SECTION_IDS.includes(activeSection)) return;
    dispatch(resetSectionStatus(activeSection));
  }, [activeSection, dispatch]);

  // ── Fix 1: Fetch on tab change OR refetchTrigger increment ────────────────
  useEffect(() => {
    if (!ENABLED_SECTION_IDS.includes(activeSection)) return;
    const promise = dispatch(
      fetchSectionData({ patientId, practiceId, sectionId: activeSection })
    ) as unknown as { abort: () => void };
    return () => {
      promise.abort();
    };
  }, [activeSection, dispatch, patientId, practiceId, refetchTrigger]);

  // Auto-clear saved badge
  useEffect(() => {
    if (saving[activeSection] !== 'saved') return;
    const t = setTimeout(
      () => dispatch(resetSavingStatus(activeSection)),
      3000
    );
    return () => clearTimeout(t);
  }, [saving, activeSection, dispatch]);

  // ── Internal save dispatcher ──────────────────────────────────────────────
  const dispatchSave = useCallback(async (): Promise<ThunkResult | null> => {
    const sd = data[activeSection];

    switch (activeSection) {
      case 1:
        return (await dispatch(
          saveMedicalHistory({ patientId, conditions: sd?.conditions ?? [] })
        )) as unknown as ThunkResult;

      case 2:
        return (await dispatch(
          saveSurgicalHistory({
            patientId,
            conditions: sd?.surgicalConditions ?? []
          })
        )) as unknown as ThunkResult;

      case 3:
        return (await dispatch(
          saveFamilyHistory({
            patientId,
            matrix: sd?.familyMatrix ?? {},
            lookups: sd?.familyLookups ?? [],
            dtos: sd?.familyDTO ?? []
          })
        )) as unknown as ThunkResult;

      case 4:
        return (await dispatch(
          saveSmokingStatus({
            patientId,
            conditions: sd?.smokingConditions ?? []
          })
        )) as unknown as ThunkResult;

      case 5:
        return (await dispatch(
          saveSocialHistory({
            patientId,
            conditions: sd?.socialConditions ?? []
          })
        )) as unknown as ThunkResult;

      default:
        return null;
    }
  }, [dispatch, activeSection, data, patientId]);

  // ── Fix 2: Shared post-save handler — success message + refetch ───────────
  const handlePostSave = useCallback(
    (result: ThunkResult | null) => {
      if (!result) return false;
      if (result.meta.requestStatus === 'fulfilled') {
        // Success snackbar
        SnackbarUtils.success(
          `Patient ${SECTION_NAMES[activeSection]} record saved successfully`,
          false
        );
        // Refetch current section fresh
        dispatch(resetSectionStatus(activeSection));
        setRefetchTrigger((n) => n + 1);
        return true;
      }
      return false;
    },
    [dispatch, activeSection]
  );

  // Save only
  const handleSave = useCallback(async () => {
    const result = await dispatchSave();
    handlePostSave(result);
  }, [dispatchSave, handlePostSave]);

  // Save then navigate
  const handleSaveAndNext = useCallback(async () => {
    const result = await dispatchSave();
    const succeeded = handlePostSave(result);
    if (succeeded && !isLastSection) {
      dispatch(setActiveSection(sorted[sorted.indexOf(activeSection) + 1]));
    }
  }, [
    dispatchSave,
    handlePostSave,
    dispatch,
    activeSection,
    sorted,
    isLastSection
  ]);

  const handleTabChange = useCallback(
    (id: number) => dispatch(setActiveSection(id)),
    [dispatch]
  );

  const handlePrev = useCallback(() => {
    const idx = sorted.indexOf(activeSection);
    if (idx > 0) dispatch(setActiveSection(sorted[idx - 1]));
  }, [dispatch, activeSection, sorted]);

  // ── Medical ───────────────────────────────────────────────────────────────
  const handleToggleCondition = useCallback(
    (conditionId: number) =>
      dispatch(toggleCondition({ sectionId: activeSection, conditionId })),
    [dispatch, activeSection]
  );

  const handleAddCustomEntry = useCallback(
    async (conditionName: string) => {
      if (activeSection !== 1 && activeSection !== 2) return;
      const existing = data[activeSection]?.conditions ?? [];
      const updated = [
        ...existing,
        {
          id: Date.now(),
          code: '0',
          conditionName,
          sourceId: 0,
          isConditionSelected: 1 as const,
          isCustom: true as const
        }
      ];
      const result = (await dispatch(
        activeSection === 1
          ? saveMedicalHistory({ patientId, conditions: updated })
          : saveSurgicalHistory({ patientId, conditions: updated as any })
      )) as unknown as ThunkResult;
      if (result.meta.requestStatus === 'fulfilled') {
        SnackbarUtils.success(
          `Patient ${SECTION_NAMES[activeSection]} record saved successfully`,
          false
        );
        dispatch(resetSectionStatus(activeSection));
        dispatch(
          fetchSectionData({ patientId, practiceId, sectionId: activeSection })
        );
      }
    },
    [dispatch, activeSection, data, patientId, practiceId]
  );

  // ── Surgical ──────────────────────────────────────────────────────────────
  const handleToggleSurgicalCondition = useCallback(
    (conditionId: number) => dispatch(toggleSurgicalCondition({ conditionId })),
    [dispatch]
  );

  const handleSetSurgicalDate = useCallback(
    (conditionId: number, date: string) =>
      dispatch(setSurgicalDate({ conditionId, date })),
    [dispatch]
  );

  const handleAddCustomSurgical = useCallback(
    async (conditionName: string) => {
      const existing = data[2]?.surgicalConditions ?? [];
      const updated = [
        ...existing,
        {
          id: Date.now(),
          code: '0',
          conditionName,
          sourceId: 0,
          isConditionSelected: 1 as const,
          isCustom: true as const
        }
      ];
      const result = (await dispatch(
        saveSurgicalHistory({ patientId, conditions: updated })
      )) as unknown as ThunkResult;
      if (result.meta.requestStatus === 'fulfilled') {
        SnackbarUtils.success(
          `Patient ${SECTION_NAMES[2]} record saved successfully`,
          false
        );
        dispatch(resetSectionStatus(2));
        dispatch(fetchSectionData({ patientId, practiceId, sectionId: 2 }));
      }
    },
    [dispatch, data, patientId, practiceId]
  );

  // ── Smoking ───────────────────────────────────────────────────────────────
  const handleSmokingSelect = useCallback(
    (conditionId: number) => dispatch(selectSmokingStatus({ conditionId })),
    [dispatch]
  );

  // ── Family ────────────────────────────────────────────────────────────────
  const handleToggleFamilyCell = useCallback(
    (lookupId: number, relationId: number) =>
      dispatch(toggleFamilyCell({ lookupId, relationId })),
    [dispatch]
  );

  const handleAddCustomFamilyRow = useCallback(
    (conditionName: string) =>
      dispatch(addCustomFamilyLookup({ conditionName })),
    [dispatch]
  );

  // ── Social ────────────────────────────────────────────────────────────────
  const handleToggleSocialCondition = useCallback(
    (conditionId: number) => dispatch(toggleSocialCondition({ conditionId })),
    [dispatch]
  );

  const handleAddCustomSocial = useCallback(
    async (conditionName: string, sourceId: number) => {
      const existing = data[5]?.socialConditions ?? [];
      const updated = [
        ...existing,
        {
          id: Date.now(),
          code: '0',
          conditionName,
          sourceId,
          practiceId: 0,
          formSectionId: 5,
          patientId,
          isConditionSelected: 1 as const,
          isCustom: true as const
        }
      ];
      const result = (await dispatch(
        saveSocialHistory({ patientId, conditions: updated })
      )) as unknown as ThunkResult;
      if (result.meta.requestStatus === 'fulfilled') {
        SnackbarUtils.success(
          `Patient ${SECTION_NAMES[5]} record saved successfully`,
          false
        );
        dispatch(resetSectionStatus(5));
        dispatch(fetchSectionData({ patientId, practiceId, sectionId: 5 }));
      }
    },
    [dispatch, data, patientId, practiceId]
  );

  const isSectionLoading =
    data[activeSection]?.status === 'loading' ||
    data[activeSection]?.status === 'idle';

  return {
    sections,
    sectionsLoading,
    activeSection,
    data,
    saving,
    isFirstSection,
    isLastSection,
    isSectionLoading,
    handleTabChange,
    handlePrev,
    handleSave,
    handleSaveAndNext,
    handleToggleCondition,
    handleAddCustomEntry,
    handleToggleSurgicalCondition,
    handleSetSurgicalDate,
    handleAddCustomSurgical,
    handleSmokingSelect,
    handleToggleFamilyCell,
    handleAddCustomFamilyRow,
    familyRelations,
    familyRelationsLoading,
    handleToggleSocialCondition,
    handleAddCustomSocial
  };
};
