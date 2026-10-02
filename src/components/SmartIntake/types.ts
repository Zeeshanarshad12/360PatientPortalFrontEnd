/**
 * Smart Intake — the practice's pre-visit intake form, opened from a link the practice sends
 * (/patientportal/intake/[token]) and filled in while signed in to the portal. Shapes mirror
 * DQ_EHR_Backend's SmartIntakePortalController (EHR.Models.Appointments.SmartIntakePortal*)
 * and the console's own copy of this wizard (DQ_Patient_Access_Console
 * components/patient-wizard), so both submit exactly the same value formats.
 */

/** The backend's intake section codes. */
export type SectionCode =
  | 'Demographics'
  | 'Insurance'
  | 'MedicalHistory'
  | 'FamilyHistory'
  | 'SocialHistory'
  | 'SurgicalHistory'
  | 'CurrentMedications';

export type Routing = 'auto' | 'review';

export type FieldType = 'text' | 'date' | 'phone' | 'email' | 'select' | 'payer';

/** A Demographics/Insurance field as the practice configured it. */
export type IntakeField = { code: string; label: string; type: FieldType; options: string[] };

export type CatalogOption = { name: string; code?: string; sourceId?: string; group?: string };

export type IntakeSection = {
  code: SectionCode;
  /** The practice's name for the section — the step title. */
  label: string;
  routing: Routing;
  fields: IntakeField[];
  /** What's on the chart already, in the wizard's value format. */
  previous: string[];
  catalog: CatalogOption[];
  submittedStatus: string | null;
};

export type IntakeForm = {
  patient: { firstName: string; lastName: string; preferredName?: string; dateOfBirth: string; phone?: string };
  appointment: { visitType?: string; start?: string; providerName?: string };
  expiresAt: string;
  sections: IntakeSection[];
  familyRelations: string[];
};

/** A drug from the EMR's drug database (DrFirst or NewCrop, per the practice's eRx setup). */
export type IntakeDrug = {
  drugId: string;
  description: string;
  drugName?: string;
  genericName?: string;
  dosage?: string;
  dosageForm?: string;
  route?: string;
  rxNorm?: string;
};

/** An insurance plan from the practice's payer list. */
export type IntakePayer = { insurancePlanId: string; payerId: string; name: string; planName?: string };

/** One submitted answer: wizard-format text, plus the drug/payer record when one was picked
 * from a search (the backend re-verifies the pick). */
export type IntakeValue = { text: string; medication?: IntakeDrug; sourceId?: string; payerId?: string };

/** A search the wizard runs; returns display labels. Cancelled results are ignored. */
export type IntakeSearch = (query: string) => Promise<string[]>;

export type FormField = { key: string; code: string; label: string; type: FieldType; options: string[]; value: string };

export type SocialGroup = { name: string; options: string[] };

export type WizardStep =
  | { kind: 'form'; code: SectionCode; label: string; fields: FormField[]; searchPayers?: IntakeSearch }
  | { kind: 'checklist'; code: SectionCode; label: string; catalog: string[]; baseline: string[] }
  | { kind: 'family-history'; code: SectionCode; label: string; relatives: string[]; conditions: string[]; baseline: string[] }
  | { kind: 'social-history'; code: SectionCode; label: string; groups: SocialGroup[]; baseline: string[] }
  | { kind: 'medications'; code: SectionCode; label: string; baseline: string[]; search: IntakeSearch };

export type SectionSubmission = { type: 'attest' } | { type: 'submit'; values: string[] };
