export interface SectionItem {
  id: number;
  name: string;
}

export type SectionStatus = 'idle' | 'loading' | 'success' | 'error';
export type SavingStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface Condition {
  id: number;
  code: string;
  conditionName: string;
  sourceId: number;
  isConditionSelected: 0 | 1;
  isCustom?: boolean;
}

export type CustomEntry = Omit<Condition, 'isCustom'> & { isCustom: true };

// ─── Section 2: Surgical History ─────────────────────────────────────────────

export interface SurgicalCondition {
  id: number;
  code: string;
  conditionName: string;
  sourceId: number;
  isConditionSelected: 0 | 1;
  /** ISO date string entered by user e.g. "2026-06-05" */
  surgeryDate?: string;
  isCustom?: boolean;
}

// ─── Section 3: Family Status ────────────────────────────────────────────────

export const FAMILY_RELATIONS = [
  { id: 1, name: 'Mother' },
  { id: 2, name: 'Father' },
  { id: 3, name: 'Grandmother' },
  { id: 4, name: 'Grandfather' },
  { id: 5, name: 'Brother' },
  { id: 6, name: 'Sister' },
  { id: 7, name: 'Other' }
] as const;

export type RelationId = typeof FAMILY_RELATIONS[number]['id'];

export interface FamilyHistoryLookup {
  id: number;
  code: string;
  conditionName: string;
  sourceId: number;
}

export type FamilyMatrix = Record<number, Set<RelationId>>;

export interface FamilyHistoryDTO {
  id: number; // actual relation record id
  relationId: number;
  patientId: number;
  relationName: string;
  familyHistoryConditions: Array<{
    id: number;
    familyHistoryId: number;
    code: string;
    conditionName: string;
    isConditionSelected: 1;
  }>;
}

// ─── Section 4: Smoking Status ────────────────────────────────────────────────

export interface SmokingCondition {
  id: number;
  code: string;
  conditionName: string;
  sourceId: number;
  practiceId: number;
  formSectionId: number;
  patientId: number;
  isConditionSelected: 0 | 1;
}

// ─── Per-section Redux state ──────────────────────────────────────────────────

export interface SectionData {
  status: SectionStatus;

  conditions: Condition[];
  customEntries: CustomEntry[];

  surgicalConditions: SurgicalCondition[];

  smokingConditions: SmokingCondition[];

  familyLookups: FamilyHistoryLookup[];

  familyMatrix: Record<number, number[]>;

  familyDTO: FamilyHistoryDTO[];
}
