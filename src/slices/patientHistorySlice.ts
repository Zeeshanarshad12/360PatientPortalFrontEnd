import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import SnackbarUtils from '../content/snackbar';
import apiServicesV2 from '@/services/requestHandler';
import { FAMILY_RELATIONS } from '@/components/PatientHistory/types/patientHistory.types';
import type {
  Condition,
  CustomEntry,
  SurgicalCondition,
  SmokingCondition,
  FamilyHistoryLookup,
  FamilyHistoryDTO,
  SectionItem,
  SectionStatus,
  SavingStatus,
  SectionData,
  RelationId
} from '@/components/PatientHistory/types/patientHistory.types';

export type {
  Condition,
  CustomEntry,
  SurgicalCondition,
  SmokingCondition,
  FamilyHistoryLookup,
  FamilyHistoryDTO,
  SectionItem,
  SectionStatus,
  SavingStatus,
  SectionData,
  RelationId
};
export { FAMILY_RELATIONS };

// ─── State ────────────────────────────────────────────────────────────────────

interface PatientHistoryState {
  sections: SectionItem[];
  sectionsLoading: boolean;
  activeSection: number;
  patientId: number;
  practiceId: number;
  data: Record<number, SectionData>;
  saving: Record<number, SavingStatus>;
}

export const ENABLED_SECTION_IDS = [1, 2, 3, 4];

const buildSectionFlags = (sectionId: number) => ({
  isIncludeMedicalHistory: sectionId === 1,
  isIncludeSurgicalHistory: sectionId === 2,
  isIncludeFamilyHistory: sectionId === 3,
  isIncludeSmokingStatus: sectionId === 4
});

const buildSectionState = (): SectionData => ({
  status: 'idle',
  conditions: [],
  customEntries: [],
  surgicalConditions: [],
  smokingConditions: [],
  familyLookups: [],
  familyMatrix: {},
  familyDTO: []
});

// ─── Save payload builders ────────────────────────────────────────────────────

const buildMedicalPayload = (patientId: number, conditions: Condition[]) =>
  conditions
    .filter((c) => c.isConditionSelected === 1)
    .map((c) => ({
      patientId,
      code: c.code ?? '0',
      description: c.conditionName,
      createdBy: ''
    }));

const buildSurgicalPayload = (
  patientId: number,
  conditions: SurgicalCondition[]
) =>
  conditions
    .filter((c) => c.isConditionSelected === 1)
    .map((c) => ({
      patientId,
      code: c.code ?? '0',
      description: c.conditionName,
      createdBy: ''
    }));

const buildSmokingPayload = (
  patientId: number,
  conditions: SmokingCondition[]
) =>
  conditions
    .filter((c) => c.isConditionSelected === 1)
    .map((c) => ({ id: c.id, sourceId: c.sourceId, patientId, createdBy: '' }));

/**
 * Build family save payload from the matrix.
 * Matrix: { [lookupId]: [relationId, ...] }
 * Output: one entry per relation that has ≥1 condition checked.
 * - id: 0 for new, actual dto.id for existing
 * - relationName: NOT sent
 * - conditions[].id: always 0
 * - conditions[].familyHistoryId: NOT sent
 * - conditions[].isConditionSelected: NOT sent
 * - conditions[].createdBy: NOT sent
 */
const buildFamilyPayload = (
  patientId: number,
  matrix: Record<number, number[]>,
  lookups: FamilyHistoryLookup[],
  dtos: FamilyHistoryDTO[]
) => {
  // Group checked cells by relationId
  const byRelation: Record<
    number,
    Array<{ code: string; conditionName: string }>
  > = {};

  Object.entries(matrix).forEach(([lookupIdStr, relationIds]) => {
    const lookupId = Number(lookupIdStr);
    const lookup = lookups.find((l) => l.id === lookupId);
    if (!lookup) return;
    relationIds.forEach((relId) => {
      if (!byRelation[relId]) byRelation[relId] = [];
      byRelation[relId].push({
        code: lookup.code,
        conditionName: lookup.conditionName
      });
    });
  });

  return FAMILY_RELATIONS.filter((rel) => byRelation[rel.id]?.length > 0).map(
    (rel) => {
      // Find existing DTO for this relation (to carry its id)
      const existing = dtos.find((d) => d.relationId === rel.id);
      return {
        id: existing?.id ?? 0,
        relationId: rel.id,
        patientId,
        createdBy: '',
        familyHistoryConditions: (byRelation[rel.id] ?? []).map((c) => ({
          id: 0,
          code: c.code,
          conditionName: c.conditionName
        }))
      };
    }
  );
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchSections = createAsyncThunk<SectionItem[], void>(
  'patientHistory/fetchSections',
  async (_, thunkAPI) => {
    try {
      const res = await apiServicesV2.GetIntakeFormSections('ApiVersion2Req');
      if (res?.status === 200 || res?.status === 201) {
        const all: SectionItem[] = res.data?.result ?? [];
        return all.filter((s) => ENABLED_SECTION_IDS.includes(s.id));
      }
      return thunkAPI.rejectWithValue({
        message: 'Unexpected response'
      }) as any;
    } catch (error: any) {
      SnackbarUtils.error(
        error?.response?.data?.message ?? 'Failed to load sections',
        false
      );
      return thunkAPI.rejectWithValue({
        message: 'Failed to load sections'
      }) as any;
    }
  }
);

export const fetchSectionData = createAsyncThunk<
  {
    sectionId: number;
    conditions: Condition[];
    surgicalConditions: SurgicalCondition[];
    smokingConditions: SmokingCondition[];
    familyLookups: FamilyHistoryLookup[];
    familyMatrix: Record<number, number[]>;
    familyDTO: FamilyHistoryDTO[];
  } | null,
  { patientId: number; practiceId: number; sectionId: number }
>(
  'patientHistory/fetchSectionData',
  async ({ patientId, practiceId, sectionId }, thunkAPI) => {
    const state: any = thunkAPI.getState();
    if (state.patientHistory.data[sectionId]?.status === 'success') return null;

    try {
      const res = await apiServicesV2.GetIntakeFormSectionData(
        { patientId, practiceId, ...buildSectionFlags(sectionId) },
        'ApiVersion2Req'
      );

      if (res?.status === 200 || res?.status === 201) {
        const result = res.data?.result ?? {};

        // ── Section 3: Family History ───────────────────────────────────────
        if (sectionId === 3) {
          const fh = result.familyHistories ?? {};
          const lookups: FamilyHistoryLookup[] = fh.lookups ?? [];
          const dtos: FamilyHistoryDTO[] = fh.familyHistoryDTO ?? [];

          // Build matrix from existing DTOs
          const matrix: Record<number, number[]> = {};
          dtos.forEach((dto) => {
            dto.familyHistoryConditions?.forEach((cond) => {
              // Match condition back to lookup by code+name
              const lookup = lookups.find(
                (l) =>
                  l.code === cond.code && l.conditionName === cond.conditionName
              );
              if (!lookup) return;
              if (!matrix[lookup.id]) matrix[lookup.id] = [];
              if (!matrix[lookup.id].includes(dto.relationId)) {
                matrix[lookup.id].push(dto.relationId);
              }
            });
          });

          return {
            sectionId,
            conditions: [],
            surgicalConditions: [],
            smokingConditions: [],
            familyLookups: lookups,
            familyMatrix: matrix,
            familyDTO: dtos
          };
        }

        // ── Section 4: Smoking ──────────────────────────────────────────────
        if (sectionId === 4) {
          return {
            sectionId,
            conditions: [],
            surgicalConditions: [],
            smokingConditions: result.smokingHistories ?? [],
            familyLookups: [],
            familyMatrix: {},
            familyDTO: []
          };
        }

        // ── Section 2: Surgical ─────────────────────────────────────────────
        if (sectionId === 2) {
          return {
            sectionId,
            conditions: [],
            surgicalConditions: result.surgicalHistories ?? [],
            smokingConditions: [],
            familyLookups: [],
            familyMatrix: {},
            familyDTO: []
          };
        }

        // ── Section 1: Medical ──────────────────────────────────────────────
        return {
          sectionId,
          conditions: result.medicalHistoryConditions ?? [],
          surgicalConditions: [],
          smokingConditions: [],
          familyLookups: [],
          familyMatrix: {},
          familyDTO: []
        };
      }

      return thunkAPI.rejectWithValue({
        sectionId,
        message: 'Unexpected response'
      }) as any;
    } catch (error: any) {
      SnackbarUtils.error(
        error?.response?.data?.message ?? 'Failed to load section',
        false
      );
      return thunkAPI.rejectWithValue({
        sectionId,
        message: 'Failed to load'
      }) as any;
    }
  }
);

export const saveMedicalHistory = createAsyncThunk<
  { sectionId: 1 },
  { patientId: number; conditions: Condition[] }
>(
  'patientHistory/saveMedicalHistory',
  async ({ patientId, conditions }, thunkAPI) => {
    try {
      const res = await apiServicesV2.SaveMedicalHistory(
        buildMedicalPayload(patientId, conditions),
        'ApiVersion2Req'
      );
      if (res?.status === 200 || res?.status === 201) return { sectionId: 1 };
      return thunkAPI.rejectWithValue({
        sectionId: 1,
        message: 'Save failed'
      }) as any;
    } catch (error: any) {
      SnackbarUtils.error(
        error?.response?.data?.message ?? 'Failed to save medical history',
        false
      );
      return thunkAPI.rejectWithValue({
        sectionId: 1,
        message: 'Failed'
      }) as any;
    }
  }
);

export const saveSurgicalHistory = createAsyncThunk<
  { sectionId: 2 },
  { patientId: number; conditions: SurgicalCondition[] }
>(
  'patientHistory/saveSurgicalHistory',
  async ({ patientId, conditions }, thunkAPI) => {
    try {
      const res = await apiServicesV2.SaveSurgicalHistory(
        buildSurgicalPayload(patientId, conditions),
        'ApiVersion2Req'
      );
      if (res?.status === 200 || res?.status === 201) return { sectionId: 2 };
      return thunkAPI.rejectWithValue({
        sectionId: 2,
        message: 'Save failed'
      }) as any;
    } catch (error: any) {
      SnackbarUtils.error(
        error?.response?.data?.message ?? 'Failed to save surgical history',
        false
      );
      return thunkAPI.rejectWithValue({
        sectionId: 2,
        message: 'Failed'
      }) as any;
    }
  }
);

export const saveFamilyHistory = createAsyncThunk<
  { sectionId: 3 },
  {
    patientId: number;
    matrix: Record<number, number[]>;
    lookups: FamilyHistoryLookup[];
    dtos: FamilyHistoryDTO[];
  }
>(
  'patientHistory/saveFamilyHistory',
  async ({ patientId, matrix, lookups, dtos }, thunkAPI) => {
    try {
      const payload = buildFamilyPayload(patientId, matrix, lookups, dtos);
      const res = await apiServicesV2.SaveFamilyHistory(
        payload,
        'ApiVersion2Req'
      );
      if (res?.status === 200 || res?.status === 201) return { sectionId: 3 };
      return thunkAPI.rejectWithValue({
        sectionId: 3,
        message: 'Save failed'
      }) as any;
    } catch (error: any) {
      SnackbarUtils.error(
        error?.response?.data?.message ?? 'Failed to save family history',
        false
      );
      return thunkAPI.rejectWithValue({
        sectionId: 3,
        message: 'Failed'
      }) as any;
    }
  }
);

export const saveSmokingStatus = createAsyncThunk<
  { sectionId: 4 },
  { patientId: number; conditions: SmokingCondition[] }
>(
  'patientHistory/saveSmokingStatus',
  async ({ patientId, conditions }, thunkAPI) => {
    try {
      const res = await apiServicesV2.SaveSmokingStatus(
        buildSmokingPayload(patientId, conditions),
        'ApiVersion2Req'
      );
      if (res?.status === 200 || res?.status === 201) return { sectionId: 4 };
      return thunkAPI.rejectWithValue({
        sectionId: 4,
        message: 'Save failed'
      }) as any;
    } catch (error: any) {
      SnackbarUtils.error(
        error?.response?.data?.message ?? 'Failed to save smoking status',
        false
      );
      return thunkAPI.rejectWithValue({
        sectionId: 4,
        message: 'Failed'
      }) as any;
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const patientHistorySlice = createSlice({
  name: 'patientHistory',
  initialState: {
    sections: [],
    sectionsLoading: false,
    activeSection: 1,
    patientId: 0,
    practiceId: 0,
    data: {
      1: buildSectionState(),
      2: buildSectionState(),
      3: buildSectionState(),
      4: buildSectionState()
    },
    saving: { 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle' }
  } as PatientHistoryState,

  reducers: {
    setActiveSection: (state, { payload }: PayloadAction<number>) => {
      state.activeSection = payload;
    },

    setPatientContext: (
      state,
      { payload }: PayloadAction<{ patientId: number; practiceId: number }>
    ) => {
      state.patientId = payload.patientId;
      state.practiceId = payload.practiceId;
    },

    // ── Medical: toggle checkbox ─────────────────────────────────────────────
    toggleCondition: (
      state,
      { payload }: PayloadAction<{ sectionId: number; conditionId: number }>
    ) => {
      const c = state.data[payload.sectionId]?.conditions.find(
        (x) => x.id === payload.conditionId
      );
      // API conditions are check-only (permanent). Custom entries can be toggled.
      if (c)
        c.isConditionSelected = c.isCustom
          ? c.isConditionSelected === 1
            ? 0
            : 1
          : 1;
    },

    // ── Medical: add custom entry locally ────────────────────────────────────
    addCustomCondition: (
      state,
      { payload }: PayloadAction<{ sectionId: number; conditionName: string }>
    ) => {
      state.data[payload.sectionId]?.conditions.push({
        id: Date.now(),
        code: '0',
        conditionName: payload.conditionName,
        sourceId: 0,
        isConditionSelected: 1,
        isCustom: true
      });
    },

    // ── Surgical: toggle checkbox ────────────────────────────────────────────
    toggleSurgicalCondition: (
      state,
      { payload }: PayloadAction<{ conditionId: number }>
    ) => {
      const c = state.data[2]?.surgicalConditions.find(
        (x) => x.id === payload.conditionId
      );
      // API conditions are check-only. Custom entries can toggle.
      if (c)
        c.isConditionSelected = c.isCustom
          ? c.isConditionSelected === 1
            ? 0
            : 1
          : 1;
    },

    // ── Surgical: set date for a condition ───────────────────────────────────
    setSurgicalDate: (
      state,
      { payload }: PayloadAction<{ conditionId: number; date: string }>
    ) => {
      const c = state.data[2]?.surgicalConditions.find(
        (x) => x.id === payload.conditionId
      );
      if (c) {
        c.surgeryDate = payload.date;
        c.isConditionSelected = 1; // checking date implicitly selects
      }
    },

    // ── Surgical: add custom entry locally ───────────────────────────────────
    addCustomSurgicalCondition: (
      state,
      { payload }: PayloadAction<{ conditionName: string }>
    ) => {
      state.data[2]?.surgicalConditions.push({
        id: Date.now(),
        code: '0',
        conditionName: payload.conditionName,
        sourceId: 0,
        isConditionSelected: 1,
        isCustom: true
      });
    },

    // ── Smoking: select one option (radio behaviour) ─────────────────────────
    selectSmokingStatus: (
      state,
      { payload }: PayloadAction<{ conditionId: number }>
    ) => {
      const section = state.data[4];
      if (!section) return;
      section.smokingConditions.forEach((c) => {
        c.isConditionSelected = c.id === payload.conditionId ? 1 : 0;
      });
    },

    // ── Family: toggle a cell in the matrix ──────────────────────────────────
    toggleFamilyCell: (
      state,
      { payload }: PayloadAction<{ lookupId: number; relationId: number }>
    ) => {
      const matrix = state.data[3]?.familyMatrix;
      if (!matrix) return;
      if (!matrix[payload.lookupId]) matrix[payload.lookupId] = [];
      const idx = matrix[payload.lookupId].indexOf(payload.relationId);
      if (idx >= 0) {
        matrix[payload.lookupId].splice(idx, 1);
      } else {
        matrix[payload.lookupId].push(payload.relationId);
      }
    },

    // ── Family: add custom lookup row ────────────────────────────────────────
    addCustomFamilyLookup: (
      state,
      { payload }: PayloadAction<{ conditionName: string }>
    ) => {
      const section = state.data[3];
      if (!section) return;
      const tempId = Date.now();
      section.familyLookups.push({
        id: tempId,
        code: '0',
        conditionName: payload.conditionName,
        sourceId: 0
      });
    },

    resetSavingStatus: (state, { payload }: PayloadAction<number>) => {
      state.saving[payload] = 'idle';
    },

    resetSectionStatus: (state, { payload }: PayloadAction<number>) => {
      if (state.data[payload]) state.data[payload].status = 'idle';
    }
  },

  extraReducers: {
    // fetchSections
    [fetchSections.pending as any]: (state: PatientHistoryState) => {
      state.sectionsLoading = true;
    },
    [fetchSections.fulfilled as any]: (
      state: PatientHistoryState,
      { payload }: PayloadAction<SectionItem[]>
    ) => {
      state.sectionsLoading = false;
      state.sections = payload;
    },
    [fetchSections.rejected as any]: (state: PatientHistoryState) => {
      state.sectionsLoading = false;
    },

    // fetchSectionData
    [fetchSectionData.pending as any]: (
      state: PatientHistoryState,
      { meta }: any
    ) => {
      const id = meta.arg.sectionId;
      if (state.data[id]) state.data[id].status = 'loading';
    },
    [fetchSectionData.fulfilled as any]: (
      state: PatientHistoryState,
      { payload }: PayloadAction<any>
    ) => {
      if (!payload) return;
      const s = state.data[payload.sectionId];
      s.status = 'success';
      s.conditions = payload.conditions;
      s.surgicalConditions = payload.surgicalConditions;
      s.smokingConditions = payload.smokingConditions;
      s.familyLookups = payload.familyLookups;
      s.familyMatrix = payload.familyMatrix;
      s.familyDTO = payload.familyDTO;
    },
    [fetchSectionData.rejected as any]: (
      state: PatientHistoryState,
      { meta }: any
    ) => {
      const id = meta.arg.sectionId;
      if (!state.data[id]) return;
      state.data[id].status = meta.aborted ? 'idle' : 'error';
    },

    // saveMedicalHistory
    [saveMedicalHistory.pending as any]: (s: PatientHistoryState) => {
      s.saving[1] = 'saving';
    },
    [saveMedicalHistory.fulfilled as any]: (s: PatientHistoryState) => {
      s.saving[1] = 'saved';
    },
    [saveMedicalHistory.rejected as any]: (s: PatientHistoryState) => {
      s.saving[1] = 'error';
    },

    // saveSurgicalHistory
    [saveSurgicalHistory.pending as any]: (s: PatientHistoryState) => {
      s.saving[2] = 'saving';
    },
    [saveSurgicalHistory.fulfilled as any]: (s: PatientHistoryState) => {
      s.saving[2] = 'saved';
    },
    [saveSurgicalHistory.rejected as any]: (s: PatientHistoryState) => {
      s.saving[2] = 'error';
    },

    // saveFamilyHistory
    [saveFamilyHistory.pending as any]: (s: PatientHistoryState) => {
      s.saving[3] = 'saving';
    },
    [saveFamilyHistory.fulfilled as any]: (s: PatientHistoryState) => {
      s.saving[3] = 'saved';
    },
    [saveFamilyHistory.rejected as any]: (s: PatientHistoryState) => {
      s.saving[3] = 'error';
    },

    // saveSmokingStatus
    [saveSmokingStatus.pending as any]: (s: PatientHistoryState) => {
      s.saving[4] = 'saving';
    },
    [saveSmokingStatus.fulfilled as any]: (s: PatientHistoryState) => {
      s.saving[4] = 'saved';
    },
    [saveSmokingStatus.rejected as any]: (s: PatientHistoryState) => {
      s.saving[4] = 'error';
    }
  }
});

export const {
  setActiveSection,
  setPatientContext,
  toggleCondition,
  addCustomCondition,
  toggleSurgicalCondition,
  setSurgicalDate,
  addCustomSurgicalCondition,
  selectSmokingStatus,
  toggleFamilyCell,
  addCustomFamilyLookup,
  resetSavingStatus,
  resetSectionStatus
} = patientHistorySlice.actions;

export default patientHistorySlice.reducer;
