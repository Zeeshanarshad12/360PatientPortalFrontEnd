import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import SnackbarUtils from '../content/snackbar';
import apiServicesV2 from '@/services/requestHandler';

import {
  FAMILY_RELATIONS,
  groupSocialConditions,
  SOCIAL_GROUP_RANGES
} from '@/components/PatientHistory/types/patientHistory.types';

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
  RelationId,
  SocialCondition,
  FamilyRelation
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
  RelationId,
  SocialCondition
};
export { FAMILY_RELATIONS, groupSocialConditions, SOCIAL_GROUP_RANGES };
export type { FamilyRelation };

// ─── State ────────────────────────────────────────────────────────────────────

interface PatientHistoryState {
  sections: SectionItem[];
  sectionsLoading: boolean;
  activeSection: number;
  patientId: number;
  practiceId: number;
  data: Record<number, SectionData>;
  saving: Record<number, SavingStatus>;
  familyRelations: FamilyRelation[]; // from getfamilyrelation API
  familyRelationsLoading: boolean;
}

export const ENABLED_SECTION_IDS = [1, 2, 3, 4, 5];

const buildSectionFlags = (sectionId: number) => ({
  isIncludeMedicalHistory: sectionId === 1,
  isIncludeSurgicalHistory: sectionId === 2,
  isIncludeFamilyHistory: sectionId === 3,
  isIncludeSmokingStatus: sectionId === 4,
  isIncludeSocialStatus: sectionId === 5
});

const buildSectionState = (): SectionData => ({
  status: 'idle',
  conditions: [],
  customEntries: [],
  surgicalConditions: [],
  smokingConditions: [],
  familyLookups: [],
  familyMatrix: {},
  familyDTO: [],
  socialConditions: []
});

// ─── Payload builders ─────────────────────────────────────────────────────────

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

const buildFamilyPayload = (
  patientId: number,
  matrix: Record<number, number[]>,
  lookups: FamilyHistoryLookup[],
  dtos: FamilyHistoryDTO[]
) => {
  // Group checked conditions by resolved relationId
  const byRelation: Record<
    number,
    Array<{ code: string; conditionName: string }>
  > = {};
  Object.entries(matrix).forEach(([lookupIdStr, relationIds]) => {
    const lookup = lookups.find((l) => l.id === Number(lookupIdStr));
    if (!lookup) return;
    relationIds.forEach((relId) => {
      if (!byRelation[relId]) byRelation[relId] = [];
      byRelation[relId].push({
        code: lookup.code,
        conditionName: lookup.conditionName
      });
    });
  });

  return Object.keys(byRelation).map((relIdStr) => {
    const resolvedRelId = Number(relIdStr);

    const existingDto =
      dtos.find((d) => d.relationId === resolvedRelId) ??
      dtos.find((d) =>
        byRelation[resolvedRelId]?.some((c) =>
          d.familyHistoryConditions.some(
            (fc) => fc.conditionName === c.conditionName
          )
        )
      );

    const relationId = existingDto?.relationId ?? resolvedRelId;
    const familyHistoryId = existingDto?.id ?? 0;

    const conditions = byRelation[resolvedRelId].map((c) => ({
      id: 0, // always 0 per BE spec
      code: c.code,
      conditionName: c.conditionName
      // tempFamilyHistoryId: removed per BE spec
    }));

    return {
      // tempId: removed per BE spec
      id: familyHistoryId, // 0 = new relation, actual id = existing
      relationId,
      patientId,
      createdBy: '',
      // relationName: not sent per BE spec
      familyHistoryConditions: conditions
    };
  });
};

const buildSocialPayload = (patientId: number, conditions: SocialCondition[]) =>
  conditions
    .filter((c) => c.isConditionSelected === 1)
    .map((c) => ({
      patientId,
      sourceId: c.sourceId,
      conditionName: c.conditionName,
      createdBy: ''
    }));

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchFamilyRelations = createAsyncThunk<FamilyRelation[], void>(
  'patientHistory/fetchFamilyRelations',
  async (_, thunkAPI) => {
    try {
      const res = await apiServicesV2.GetFamilyRelations('ApiVersion2Req');
      if (res?.status === 200 || res?.status === 201) {
        return res.data?.result ?? [];
      }
      return thunkAPI.rejectWithValue({
        message: 'Unexpected response'
      }) as any;
    } catch (error: any) {
      SnackbarUtils.error(
        error?.response?.data?.message ?? 'Failed to load family relations',
        false
      );
      return thunkAPI.rejectWithValue({ message: 'Failed' }) as any;
    }
  }
);

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
    socialConditions: SocialCondition[];
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

        if (sectionId === 3) {
          const fh = result.familyHistories ?? {};
          const lookups: FamilyHistoryLookup[] = fh.lookups ?? [];
          const dtos: FamilyHistoryDTO[] = fh.familyHistoryDTO ?? [];
          // Get family relations from Redux state (loaded by fetchFamilyRelations on mount)
          const stateNow: any = thunkAPI.getState();
          const apiRelations: Array<{ id: number; name: string }> =
            stateNow.patientHistory.familyRelations ?? [];

          const resolveRelationId = (dto: FamilyHistoryDTO): number => {
            if (apiRelations.some((r) => r.id === dto.relationId)) {
              return dto.relationId;
            }
            const byName = apiRelations.find(
              (r) => r.name.toLowerCase() === dto.relationName.toLowerCase()
            );
            if (byName) return byName.id;
            return dto.relationId;
          };

          const matrix: Record<number, number[]> = {};
          dtos.forEach((dto) => {
            const resolvedRelId = resolveRelationId(dto);
            dto.familyHistoryConditions?.forEach((cond) => {
              const lookup = lookups.find(
                (l) => l.conditionName === cond.conditionName
              );
              if (!lookup) return;
              if (!matrix[lookup.id]) matrix[lookup.id] = [];
              if (!matrix[lookup.id].includes(resolvedRelId)) {
                matrix[lookup.id].push(resolvedRelId);
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
            familyDTO: dtos,
            socialConditions: []
          };
        }

        if (sectionId === 4) {
          return {
            sectionId,
            conditions: [],
            surgicalConditions: [],
            smokingConditions: (result.smokingHistories ?? []).map(
              (c: any) => ({ ...c, isApiChecked: c.isConditionSelected === 1 })
            ),
            familyLookups: [],
            familyMatrix: {},
            familyDTO: [],
            socialConditions: []
          };
        }

        if (sectionId === 2) {
          return {
            sectionId,
            conditions: [],
            surgicalConditions: (result.surgicalHistories ?? []).map(
              (c: any) => ({ ...c, isApiChecked: c.isConditionSelected === 1 })
            ),
            smokingConditions: [],
            familyLookups: [],
            familyMatrix: {},
            familyDTO: [],
            socialConditions: []
          };
        }

        if (sectionId === 5) {
          return {
            sectionId,
            conditions: [],
            surgicalConditions: [],
            smokingConditions: [],
            familyLookups: [],
            familyMatrix: {},
            familyDTO: [],
            socialConditions: (result.socialHistories ?? []).map((c: any) => ({
              ...c,
              isApiChecked: c.isConditionSelected === 1
            }))
          };
        }

        // Section 1: Medical
        return {
          sectionId,
          conditions: (result.medicalHistoryConditions ?? []).map((c: any) => ({
            ...c,
            isApiChecked: c.isConditionSelected === 1
          })),
          surgicalConditions: [],
          smokingConditions: [],
          familyLookups: [],
          familyMatrix: {},
          familyDTO: [],
          socialConditions: []
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
      const res = await apiServicesV2.SaveFamilyHistory(
        buildFamilyPayload(patientId, matrix, lookups, dtos),
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

export const saveSocialHistory = createAsyncThunk<
  { sectionId: 5 },
  { patientId: number; conditions: SocialCondition[] }
>(
  'patientHistory/saveSocialHistory',
  async ({ patientId, conditions }, thunkAPI) => {
    try {
      const res = await apiServicesV2.SaveSocialStatus(
        buildSocialPayload(patientId, conditions),
        'ApiVersion2Req'
      );
      if (res?.status === 200 || res?.status === 201) return { sectionId: 5 };
      return thunkAPI.rejectWithValue({
        sectionId: 5,
        message: 'Save failed'
      }) as any;
    } catch (error: any) {
      SnackbarUtils.error(
        error?.response?.data?.message ?? 'Failed to save social history',
        false
      );
      return thunkAPI.rejectWithValue({
        sectionId: 5,
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
      4: buildSectionState(),
      5: buildSectionState()
    },
    saving: { 1: 'idle', 2: 'idle', 3: 'idle', 4: 'idle', 5: 'idle' },
    familyRelations: [],
    familyRelationsLoading: false
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
    toggleCondition: (
      state,
      { payload }: PayloadAction<{ sectionId: number; conditionId: number }>
    ) => {
      const c = state.data[payload.sectionId]?.conditions.find(
        (x) => x.id === payload.conditionId
      );
      if (!c) return;
      if (c.isApiChecked) return; // locked: was checked when loaded from API
      c.isConditionSelected = c.isConditionSelected === 1 ? 0 : 1;
    },
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
    toggleSurgicalCondition: (
      state,
      { payload }: PayloadAction<{ conditionId: number }>
    ) => {
      const c = state.data[2]?.surgicalConditions.find(
        (x) => x.id === payload.conditionId
      );
      if (!c) return;
      if (c.isApiChecked) return;
      c.isConditionSelected = c.isConditionSelected === 1 ? 0 : 1;
    },
    setSurgicalDate: (
      state,
      { payload }: PayloadAction<{ conditionId: number; date: string }>
    ) => {
      const c = state.data[2]?.surgicalConditions.find(
        (x) => x.id === payload.conditionId
      );
      if (c) {
        c.surgeryDate = payload.date;
        c.isConditionSelected = 1;
      }
    },
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
    selectSmokingStatus: (
      state,
      { payload }: PayloadAction<{ conditionId: number }>
    ) => {
      const c = state.data[4]?.smokingConditions.find(
        (x) => x.id === payload.conditionId
      );
      if (!c) return;
      if (c.isApiChecked) return;
      c.isConditionSelected = c.isConditionSelected === 1 ? 0 : 1;
    },
    toggleFamilyCell: (
      state,
      { payload }: PayloadAction<{ lookupId: number; relationId: number }>
    ) => {
      const section = state.data[3];
      if (!section) return;
      const matrix = section.familyMatrix;
      const lookups = section.familyLookups;
      const dtos = section.familyDTO;

      const lookup = lookups.find((l) => l.id === payload.lookupId);
      if (!lookup) return;

      const isApiChecked = dtos.some(
        (dto) =>
          dto.relationId === payload.relationId &&
          dto.familyHistoryConditions.some(
            (c) => c.conditionName === lookup.conditionName
          )
      );
      if (isApiChecked) return; // Cannot uncheck API-saved cells

      if (!matrix[payload.lookupId]) matrix[payload.lookupId] = [];
      const idx = matrix[payload.lookupId].indexOf(payload.relationId);
      if (idx >= 0) {
        matrix[payload.lookupId].splice(idx, 1);
      } else {
        matrix[payload.lookupId].push(payload.relationId);
      }
    },
    addCustomFamilyLookup: (
      state,
      { payload }: PayloadAction<{ conditionName: string }>
    ) => {
      state.data[3]?.familyLookups.push({
        id: Date.now(),
        code: '0',
        conditionName: payload.conditionName,
        sourceId: 0
      });
    },
    toggleSocialCondition: (
      state,
      { payload }: PayloadAction<{ conditionId: number }>
    ) => {
      const c = state.data[5]?.socialConditions.find(
        (x) => x.id === payload.conditionId
      );
      if (!c) return;
      if (c.isApiChecked) return;
      c.isConditionSelected = c.isConditionSelected === 1 ? 0 : 1;
    },
    addCustomSocialCondition: (
      state,
      { payload }: PayloadAction<{ conditionName: string; sourceId: number }>
    ) => {
      state.data[5]?.socialConditions.push({
        id: Date.now(),
        code: '0',
        conditionName: payload.conditionName,
        sourceId: payload.sourceId,
        practiceId: 0,
        formSectionId: 5,
        patientId: 0,
        isConditionSelected: 1,
        isCustom: true
      });
    },
    resetSavingStatus: (state, { payload }: PayloadAction<number>) => {
      state.saving[payload] = 'idle';
    },
    resetSectionStatus: (state, { payload }: PayloadAction<number>) => {
      if (!state.data[payload]) return;
      // Reset status AND clear data arrays so refetch fully replaces (no duplicates)
      state.data[payload].status = 'idle';
      state.data[payload].conditions = [];
      state.data[payload].surgicalConditions = [];
      state.data[payload].smokingConditions = [];
      state.data[payload].socialConditions = [];
      state.data[payload].familyLookups = [];
      state.data[payload].familyMatrix = {};
      state.data[payload].familyDTO = [];
    }
  },

  extraReducers: {
    [fetchFamilyRelations.pending as any]: (s: PatientHistoryState) => {
      s.familyRelationsLoading = true;
    },
    [fetchFamilyRelations.fulfilled as any]: (
      s: PatientHistoryState,
      { payload }: PayloadAction<FamilyRelation[]>
    ) => {
      s.familyRelationsLoading = false;
      s.familyRelations = payload;
    },
    [fetchFamilyRelations.rejected as any]: (s: PatientHistoryState) => {
      s.familyRelationsLoading = false;
    },

    [fetchSections.pending as any]: (s: PatientHistoryState) => {
      s.sectionsLoading = true;
    },
    [fetchSections.fulfilled as any]: (
      s: PatientHistoryState,
      { payload }: PayloadAction<SectionItem[]>
    ) => {
      s.sectionsLoading = false;
      s.sections = payload;
    },
    [fetchSections.rejected as any]: (s: PatientHistoryState) => {
      s.sectionsLoading = false;
    },

    [fetchSectionData.pending as any]: (
      s: PatientHistoryState,
      { meta }: any
    ) => {
      if (s.data[meta.arg.sectionId])
        s.data[meta.arg.sectionId].status = 'loading';
    },
    [fetchSectionData.fulfilled as any]: (
      s: PatientHistoryState,
      { payload }: PayloadAction<any>
    ) => {
      if (!payload) return;
      const sec = s.data[payload.sectionId];
      sec.status = 'success';
      sec.conditions = payload.conditions;
      sec.surgicalConditions = payload.surgicalConditions;
      sec.smokingConditions = payload.smokingConditions;
      sec.familyLookups = payload.familyLookups;
      sec.familyMatrix = payload.familyMatrix;
      sec.familyDTO = payload.familyDTO;
      sec.socialConditions = payload.socialConditions;
    },
    [fetchSectionData.rejected as any]: (
      s: PatientHistoryState,
      { meta }: any
    ) => {
      if (!s.data[meta.arg.sectionId]) return;
      s.data[meta.arg.sectionId].status = meta.aborted ? 'idle' : 'error';
    },

    [saveMedicalHistory.pending as any]: (s: PatientHistoryState) => {
      s.saving[1] = 'saving';
    },
    [saveMedicalHistory.fulfilled as any]: (s: PatientHistoryState) => {
      s.saving[1] = 'saved';
    },
    [saveMedicalHistory.rejected as any]: (s: PatientHistoryState) => {
      s.saving[1] = 'error';
    },
    [saveSurgicalHistory.pending as any]: (s: PatientHistoryState) => {
      s.saving[2] = 'saving';
    },
    [saveSurgicalHistory.fulfilled as any]: (s: PatientHistoryState) => {
      s.saving[2] = 'saved';
    },
    [saveSurgicalHistory.rejected as any]: (s: PatientHistoryState) => {
      s.saving[2] = 'error';
    },
    [saveFamilyHistory.pending as any]: (s: PatientHistoryState) => {
      s.saving[3] = 'saving';
    },
    [saveFamilyHistory.fulfilled as any]: (s: PatientHistoryState) => {
      s.saving[3] = 'saved';
    },
    [saveFamilyHistory.rejected as any]: (s: PatientHistoryState) => {
      s.saving[3] = 'error';
    },
    [saveSmokingStatus.pending as any]: (s: PatientHistoryState) => {
      s.saving[4] = 'saving';
    },
    [saveSmokingStatus.fulfilled as any]: (s: PatientHistoryState) => {
      s.saving[4] = 'saved';
    },
    [saveSmokingStatus.rejected as any]: (s: PatientHistoryState) => {
      s.saving[4] = 'error';
    },
    [saveSocialHistory.pending as any]: (s: PatientHistoryState) => {
      s.saving[5] = 'saving';
    },
    [saveSocialHistory.fulfilled as any]: (s: PatientHistoryState) => {
      s.saving[5] = 'saved';
    },
    [saveSocialHistory.rejected as any]: (s: PatientHistoryState) => {
      s.saving[5] = 'error';
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
  toggleSocialCondition,
  addCustomSocialCondition,
  resetSavingStatus,
  resetSectionStatus
} = patientHistorySlice.actions;

export default patientHistorySlice.reducer;
