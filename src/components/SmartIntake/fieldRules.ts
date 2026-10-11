import type { FieldType, FormField, SectionCode } from './types';

/**
 * Input masks and checks for the Demographics / Insurance fields — the same formats and rules
 * DQ_EHR_Frontend's patient demographics use (ThemeMaskedInput's MaskedFax "(000) 000-0000"
 * phone and MaskedZip "00000-0000" masks, validations/schemas.ts' email and ZIP patterns; city and
 * state come from the ZIP, as in its Reusablezipfield), plus the field groups the backend's
 * ResolveForm needs whole, so the patient sees a problem before saving.
 */

/** How a field is masked/checked: by field code where the practice's type is plain text. */
export type FieldKind =
  | 'phone'
  | 'zip'
  | 'city'
  | 'state'
  | 'date'
  | 'email'
  | 'name'
  | 'text'
  | 'select'
  | 'payer';

const PHONE_CODES = new Set([
  'Phone',
  'PharmacyPhone',
  'EmergencyContactPhone'
]);
const DATE_CODES = new Set(['DateOfBirth', 'PolicyHolderDateOfBirth']);
const NAME_CODES = new Set([
  'FullLegalName',
  'EmergencyContactName',
  'PolicyHolderName'
]);

export function fieldKind(field: Pick<FormField, 'code' | 'type'>): FieldKind {
  const type: FieldType = field.type;
  if (type === 'select' || type === 'payer' || type === 'email') return type;
  if (type === 'phone' || PHONE_CODES.has(field.code)) return 'phone';
  if (type === 'date' || DATE_CODES.has(field.code)) return 'date';
  if (field.code === 'Zip') return 'zip';
  if (field.code === 'City') return 'city';
  if (field.code === 'State') return 'state';
  if (NAME_CODES.has(field.code)) return 'name';
  return 'text';
}

const digits = (value: string) => value.replace(/\D/g, '');

/** (000) 000-0000, the EHR's phone mask, built up as it's typed. */
export function formatPhone(value: string): string {
  let d = digits(value);
  // A chart number saved with the US country code (+1 212 555 0100).
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  d = d.slice(0, 10);
  if (!d) return '';
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** 00000 or 00000-0000. */
export function formatZip(value: string): string {
  const d = digits(value).slice(0, 9);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** MM/DD/YYYY; a chart date in ISO form (yyyy-mm-dd) is converted rather than mangled. */
export function formatDate(value: string): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (iso) return `${iso[2]}/${iso[3]}/${iso[1]}`;
  const d = digits(value).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export const US_STATES: { code: string; name: string }[] = [
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CA', 'California'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['DC', 'District of Columbia'],
  ['FL', 'Florida'],
  ['GA', 'Georgia'],
  ['HI', 'Hawaii'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['KY', 'Kentucky'],
  ['LA', 'Louisiana'],
  ['ME', 'Maine'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MN', 'Minnesota'],
  ['MS', 'Mississippi'],
  ['MO', 'Missouri'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['TX', 'Texas'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
  ['AS', 'American Samoa'],
  ['GU', 'Guam'],
  ['MP', 'Northern Mariana Islands'],
  ['PR', 'Puerto Rico'],
  ['VI', 'U.S. Virgin Islands']
].map(([code, name]) => ({ code, name }));

/** A chart state ("ny", "New York") as its two-letter code; anything else is kept as-is. */
export function normalizeState(value: string): string {
  const v = value.trim();
  const match = US_STATES.find(
    (s) =>
      s.code.toLowerCase() === v.toLowerCase() ||
      s.name.toLowerCase() === v.toLowerCase()
  );
  return match ? match.code : v;
}

/** Puts a value in the field's display format (used for chart values and while typing). */
export function formatValue(kind: FieldKind, value: string): string {
  switch (kind) {
    case 'phone':
      return formatPhone(value);
    case 'zip':
      return formatZip(value);
    case 'date':
      return formatDate(value);
    case 'state':
      return normalizeState(value);
    default:
      return value;
  }
}

// validations/schemas.ts in DQ_EHR_Frontend.
const EMAIL =
  /^[A-Za-z0-9]+(?:[._%+-][A-Za-z0-9]+)*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;
const ZIP = /^\d{5}(-\d{4})?$/;
const HAS_DIGIT = /\d/;

function dateError(value: string, label: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return 'Enter the date as MM/DD/YYYY.';
  const [month, day, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return 'Enter a valid date.';
  if (year < 1900) return 'Enter a valid date.';
  if (date.getTime() > Date.now()) return `${label} can't be in the future.`;
  return null;
}

/** One field's own format; blank is fine here (the group rules below decide what's required). */
function formatError(field: FormField, value: string): string | null {
  if (!value) return null;
  switch (fieldKind(field)) {
    case 'phone':
      return digits(value).length === 10
        ? null
        : 'Enter a 10-digit phone number.';
    case 'zip':
      return ZIP.test(value) ? null : 'ZIP code can be 5 or 9 digits only.';
    case 'state':
      return US_STATES.some((s) => s.code === value)
        ? null
        : 'Enter a valid ZIP code to fill in the state.';
    case 'date':
      return dateError(value, field.label);
    case 'email':
      return EMAIL.test(value) ? null : "Email doesn't look right.";
    case 'name':
      if (HAS_DIGIT.test(value)) return "Names can't contain numbers.";
      if (value.length > 100) return 'Too long.';
      return null;
    case 'select':
      return field.options.length && !field.options.includes(value)
        ? 'Choose one of the options.'
        : null;
    default:
      return value.length > 256 ? 'Too long.' : null;
  }
}

/**
 * Errors by field index ('' = none). Format checks per field, then the rules the backend
 * applies to the section as a whole (SmartIntakeChartWriter.ResolveForm).
 */
export function validateFields(
  section: SectionCode,
  fields: FormField[],
  values: string[]
): string[] {
  const errors = fields.map(
    (f, i) => formatError(f, (values[i] ?? '').trim()) ?? ''
  );
  const at = (code: string) => fields.findIndex((f) => f.code === code);
  const has = (code: string) => {
    const i = at(code);
    return i >= 0 && (values[i] ?? '').trim().length > 0;
  };
  const require = (code: string, message: string) => {
    const i = at(code);
    if (i >= 0 && !errors[i] && !has(code)) errors[i] = message;
  };

  if (section === 'Demographics') {
    require('FullLegalName', 'Required.');
    require('DateOfBirth', 'Required.');
    const legal = at('FullLegalName');
    if (
      legal >= 0 &&
      !errors[legal] &&
      (values[legal] ?? '').trim().split(/\s+/).length < 2
    )
      errors[legal] = 'Enter your first and last name.';

    const address = ['AddressLine1', 'City', 'State', 'Zip'];
    if (address.some(has))
      address.forEach((code) =>
        require(code, 'Required to complete the address.')
      );

    if (has('EmergencyContactRelation') || has('EmergencyContactPhone'))
      require('EmergencyContactName', 'Add the contact’s name.');
    if (has('EmergencyContactName')) {
      require('EmergencyContactRelation', 'Choose the relationship.');
      const name = at('EmergencyContactName');
      if (!errors[name] && (values[name] ?? '').trim().split(/\s+/).length < 2)
        errors[name] = 'Enter first and last name.';
    }

    if (has('PharmacyPhone')) require('PharmacyName', 'Add the pharmacy name.');
  }

  if (section === 'Insurance') {
    const policy = [
      'MemberId',
      'GroupNumber',
      'PolicyHolderName',
      'PolicyHolderRelation',
      'PolicyHolderDateOfBirth'
    ];
    if (policy.some(has)) require('Payer', 'Choose your insurance provider.');
    if (has('Payer')) require('MemberId', 'Required.');
    for (const code of ['MemberId', 'GroupNumber']) {
      const i = at(code);
      if (i >= 0 && !errors[i] && (values[i] ?? '').trim().length > 50)
        errors[i] = 'Must be 50 characters or fewer.';
    }
  }

  return errors;
}
