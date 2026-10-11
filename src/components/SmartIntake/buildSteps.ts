import { format } from 'date-fns';
import type { IntakeForm, IntakeSearch, IntakeSection, WizardStep } from './types';
import { fieldKind, formatValue } from './fieldRules';

/** Token-bound calls the steps make. `signConsent` records a consent signed for the link's visit. */
export type IntakeSearches = { drugs: IntakeSearch; payers: IntakeSearch; signConsent: (consentFormId: string, signature: string) => Promise<void> };

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
      // Demographics / Insurance: the practice's own fields, labels and order, pre-filled with
      // what the chart has (contact details, pharmacy, emergency contact; the primary policy) to
      // confirm or correct. Demographics falls back to the link's patient record.
      const defaults = code === 'Demographics' ? demographicsDefaults(form) : {};
      const onChart = chartAnswers(section.previous);
      return {
        kind: 'form',
        code,
        label,
        fields: section.fields.map((f) => {
          const value = onChart.get(f.label.trim().toLowerCase()) || defaults[f.code] || '';
          return { key: `${code}-${f.code}`, code: f.code, label: f.label, type: f.type, options: f.options, value: formatValue(fieldKind(f), value) };
        }),
        searchPayers: searches.payers
      };
    }
  }
}

/** The wizard's steps: the practice's sections in its order, then the consent forms the visit
 * type requires — signed with the portal's own consent signing (dbo.SignedConsentForms), the
 * same as the Consent Forms page. A form already signed for THIS visit isn't shown again (nothing
 * left to do); a signature from another visit doesn't count, so that form is still asked for. */
export function buildSteps(form: IntakeForm, searches: IntakeSearches): WizardStep[] {
  const visitDate = form.appointment.start ? new Date(form.appointment.start) : null;
  const consentSteps: WizardStep[] = form.consents.filter((consent) => !consent.signed).map((consent) => ({
    kind: 'consent',
    label: consent.name,
    consent,
    patientId: form.patientId,
    // The signed PDF is filed under this title - one per visit (the portal skips a same-titled
    // upload), and the console matches it back to the visit's consent by the form-name prefix.
    documentTitle: visitDate && !Number.isNaN(visitDate.getTime()) ? `${consent.name} - visit ${visitDate.toLocaleDateString('en-US')}` : consent.name,
    sign: (signature: string) => searches.signConsent(consent.consentFormId, signature)
  }));
  return [...form.sections.map((section) => buildStep(section, form, searches)), ...consentSteps];
}
