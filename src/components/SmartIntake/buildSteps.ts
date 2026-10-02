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
      return {
        kind: 'form',
        code,
        label,
        fields: section.fields.map((f) => ({ key: `${code}-${f.code}`, code: f.code, label: f.label, type: f.type, options: f.options, value: defaults[f.code] ?? '' })),
        searchPayers: searches.payers
      };
    }
  }
}

/** The wizard's steps, in the practice's section order. Consent forms aren't part of this
 * wizard yet — signatures here aren't recorded anywhere real. */
export function buildSteps(form: IntakeForm, searches: IntakeSearches): WizardStep[] {
  return form.sections.map((section) => buildStep(section, form, searches));
}
