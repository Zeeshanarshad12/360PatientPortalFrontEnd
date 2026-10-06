import { format } from 'date-fns';
import type { IntakeForm, IntakeSearch, IntakeSection, WizardStep } from './types';

export type IntakeSearches = { drugs: IntakeSearch; payers: IntakeSearch };

/** Demographics fields the chart can pre-fill, keyed by field code (labels are the practice's). */
function demographicsDefaults(form: IntakeForm): Record<string, string> {
  const dob = form.patient.dateOfBirth ? new Date(form.patient.dateOfBirth) : null;
  return {
    FullLegalName: `${form.patient.firstName} ${form.patient.lastName}`.trim(),
    DateOfBirth: dob && !Number.isNaN(dob.getTime()) ? format(dob, 'MM/dd/yyyy') : '',
    PreferredName: form.patient.preferredName ?? '',
    Phone: form.patient.phone ?? ''
  };
}

/** "Label: answer" texts the backend sends as what's on the chart -> answer by lower-cased label. */
function chartAnswers(previous: string[]): Map<string, string> {
  const answers = new Map<string, string>();
  for (const text of previous) {
    const at = text.indexOf(': ');
    if (at > 0) answers.set(text.slice(0, at).trim().toLowerCase(), text.slice(at + 2).trim());
  }
  return answers;
}

function buildStep(section: IntakeSection, form: IntakeForm, searches: IntakeSearches): WizardStep {
  const { code, label } = section;
  const names = section.catalog.map((o) => o.name);
  switch (code) {
    case 'MedicalHistory':
    case 'SurgicalHistory':
      return { kind: 'checklist', code, label, catalog: names, baseline: section.previous };
    case 'FamilyHistory':
      return { kind: 'family-history', code, label, relatives: form.familyRelations, conditions: names, baseline: section.previous };
    case 'SocialHistory': {
      // One group per EMR category (Marital Status, Working Status, Diet, Alcohol) plus
      // Smoking Status — "Group: Option" is the value format the backend resolves.
      const groups = new Map<string, string[]>();
      for (const option of section.catalog) {
        const group = option.group ?? 'Social History';
        groups.set(group, [...(groups.get(group) ?? []), option.name]);
      }
      return { kind: 'social-history', code, label, groups: [...groups.entries()].map(([name, options]) => ({ name, options })), baseline: section.previous };
    }
    case 'CurrentMedications':
      // The EMR's drug database: only a drug picked from it can go on the chart. The baseline
      // is the patient's active medication list, so keeping it as-is attests.
      return { kind: 'medications', code, label, baseline: section.previous, search: searches.drugs };
    default: {
      // Demographics / Insurance: the practice's own fields, labels and order.
      const defaults = code === 'Demographics' ? demographicsDefaults(form) : {};
      // Insurance: the primary policy already on the chart, to confirm or correct. Demographics
      // pre-fills from the patient record above.
      const onChart = code === 'Insurance' ? chartAnswers(section.previous) : new Map<string, string>();
      return {
        kind: 'form',
        code,
        label,
        fields: section.fields.map((f) => ({ key: `${code}-${f.code}`, code: f.code, label: f.label, type: f.type, options: f.options, value: defaults[f.code] ?? onChart.get(f.label.trim().toLowerCase()) ?? '' })),
        searchPayers: searches.payers
      };
    }
  }
}

/** The wizard's steps: the practice's sections in its order, then the consent forms the visit
 * type requires — signed with the portal's own consent signing (dbo.SignedConsentForms), the
 * same as the Consent Forms page. */
export function buildSteps(form: IntakeForm, searches: IntakeSearches): WizardStep[] {
  const consentSteps: WizardStep[] = form.consents.map((consent) => ({ kind: 'consent', label: consent.name, consent, patientId: form.patientId }));
  return [...form.sections.map((section) => buildStep(section, form, searches)), ...consentSteps];
}
