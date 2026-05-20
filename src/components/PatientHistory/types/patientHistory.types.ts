// ─── Shared ───────────────────────────────────────────────────────────────────

export interface SectionItem {
  id: number;
  name: string;
}

export type SectionStatus = 'idle' | 'loading' | 'success' | 'error';
export type SavingStatus = 'idle' | 'saving' | 'saved' | 'error';

// ─── Section 1: Medical History ───────────────────────────────────────────────

export interface Condition {
  id: number;
  code: string;
  conditionName: string;
  sourceId: number;
  isConditionSelected: 0 | 1;
  isCustom?: boolean;
  isApiChecked?: boolean;
}

export type CustomEntry = Omit<Condition, 'isCustom'> & { isCustom: true };

// ─── Section 2: Surgical History ─────────────────────────────────────────────

export interface SurgicalCondition {
  id: number;
  code: string;
  conditionName: string;
  sourceId: number;
  isConditionSelected: 0 | 1;
  surgeryDate?: string;
  isCustom?: boolean;
  isApiChecked?: boolean;
}

// ─── Section 3: Family History ────────────────────────────────────────────────

export interface FamilyRelation {
  id: number; // generalLookup id e.g. 563 = Mother
  name: string; // e.g. "Mother", "Father"
}

// FAMILY_RELATIONS kept only as a fallback if API hasn't loaded yet
export const FAMILY_RELATIONS: FamilyRelation[] = [
  { id: 563, name: 'Mother' },
  { id: 558, name: 'Father' },
  { id: 531, name: 'Grandmother' },
  { id: 528, name: 'Grandfather' },
  { id: 572, name: 'Brother' },
  { id: 589, name: 'Sister' },
  { id: 4720, name: 'Other' }
];

export type RelationId = number;

export interface FamilyHistoryLookup {
  id: number;
  code: string;
  conditionName: string;
  sourceId: number;
}

export type FamilyMatrix = Record<number, Set<RelationId>>;

export interface FamilyHistoryDTO {
  id: number;
  relationId: number;
  patientId: number;
  relationName: string;
  familyHistoryConditions: Array<{
    id: number;
    familyHistoryId: number;
    code: string;
    conditionName: string;
    isConditionSelected: 1;
    isApiChecked?: boolean;
  }>;
}

export interface FamilyRelationColumn {
  relationId: number; // from dto.relationId (generalLookup)
  relationName: string; // from dto.relationName
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
  isCustom?: boolean;
  isApiChecked?: boolean;
}

// ─── Section 5: Social History ────────────────────────────────────────────────

export interface SocialCondition {
  id: number;
  code: string;
  conditionName: string;
  sourceId: number;
  practiceId: number;
  formSectionId: number;
  patientId: number;
  isConditionSelected: 0 | 1;
  isCustom?: boolean;
  isApiChecked?: boolean;
}

export interface SocialGroup {
  name: string;
  conditions: SocialCondition[];
}

export const SOCIAL_GROUP_RANGES: Array<{
  label: string;
  min: number;
  max: number;
}> = [
  { label: 'Marital Status', min: 308, max: 319 },
  { label: 'Employment Status', min: 267, max: 275 },
  { label: 'Diet', min: 320, max: 335 },
  { label: 'Alcohol', min: 61, max: 65 }
];

export const groupSocialConditions = (
  items: SocialCondition[]
): SocialGroup[] =>
  SOCIAL_GROUP_RANGES.map(({ label, min, max }) => ({
    name: label,
    conditions: items.filter((c) => c.sourceId >= min && c.sourceId <= max)
  })).filter((g) => g.conditions.length > 0);

// ─── Per-section Redux state ──────────────────────────────────────────────────

export interface SectionData {
  status: SectionStatus;
  /** Medical (1) */
  conditions: Condition[];
  customEntries: CustomEntry[];
  /** Surgical (2) */
  surgicalConditions: SurgicalCondition[];
  /** Smoking (4) */
  smokingConditions: SmokingCondition[];
  /** Family (3) */
  familyLookups: FamilyHistoryLookup[];
  familyMatrix: Record<number, number[]>;
  familyDTO: FamilyHistoryDTO[];
  /** Social (5) */
  socialConditions: SocialCondition[];
}
