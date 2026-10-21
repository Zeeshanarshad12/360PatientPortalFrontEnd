import axios from 'axios';
import apiServicesV2 from '@/services/requestHandler';
import { SERVICE_URLSV2 } from '@/services/ServiceUrl';
import { clearIntakeSession, currentIntakeSession, getIntakeSession, hasPortalSession } from './intakeSession';
import type { CatalogOption, FieldType, IntakeConsent, IntakeDrug, IntakeField, IntakeForm, IntakePayer, IntakeSection, IntakeValue, SectionCode } from './types';

type Row = Record<string, unknown>;

/** Reads camelCase or PascalCase — the backend's JSON casing isn't pinned per endpoint. */
function pick(row: Row, key: string): unknown {
  return row?.[key] ?? row?.[key.charAt(0).toLowerCase() + key.slice(1)];
}
function str(row: Row, key: string): string | undefined {
  const v = pick(row, key);
  return v == null || v === '' ? undefined : String(v);
}
function rows(row: Row, key: string): Row[] {
  const v = pick(row, key);
  return Array.isArray(v) ? (v as Row[]) : [];
}
const texts = (values: Row[]) => values.map((v) => str(v, 'Text') ?? '').filter(Boolean);

/** The payer of the policy on the chart ("Label: plan" with its plan/payer ids), so keeping it
 * submits the same pick a search would have. */
function chartPayer(values: Row[]): IntakePayer | undefined {
  for (const v of values) {
    const text = str(v, 'Text') ?? '';
    const at = text.indexOf(': ');
    const planId = str(v, 'SourceId');
    const payerId = str(v, 'PayerId');
    if (at > 0 && planId && payerId) return { insurancePlanId: planId, payerId, name: text.slice(at + 2).trim() };
  }
  return undefined;
}

const SECTION_CODES: SectionCode[] = ['Demographics', 'Insurance', 'MedicalHistory', 'FamilyHistory', 'SocialHistory', 'SurgicalHistory', 'CurrentMedications'];
const FIELD_TYPES: FieldType[] = ['text', 'date', 'phone', 'email', 'select', 'payer'];

/** The AutoWrapper envelope ({ result }) most endpoints return. */
function unwrap(res: { data?: unknown } | null | undefined): unknown {
  const data = res?.data as Row | undefined;
  return data && 'result' in data ? data.result : data;
}

/** A failed call, with the HTTP status and the backend's own message when there is one. */
export class IntakeApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

function toError(err: unknown, fallback: string): IntakeApiError {
  // HttpProvider's request() throws the axios response (undefined on a network failure).
  const res = err as { status?: number; data?: Row | string } | undefined;
  const data = res?.data;
  const message =
    typeof data === 'string'
      ? data
      : (data?.responseException as Row | undefined)?.exceptionMessage ?? data?.message ?? (typeof data?.result === 'string' ? data.result : undefined);
  return new IntakeApiError(typeof message === 'string' && message.trim() ? message : fallback, res?.status);
}

function mapField(row: Row): IntakeField {
  const type = String(pick(row, 'FieldType')) as FieldType;
  const options = pick(row, 'Options');
  return {
    code: str(row, 'FieldCode') ?? '',
    label: str(row, 'Label') ?? '',
    type: FIELD_TYPES.includes(type) ? type : 'text',
    options: Array.isArray(options) ? options.map(String).filter(Boolean) : []
  };
}

function mapOption(row: Row): CatalogOption {
  return { name: str(row, 'Name') ?? '', code: str(row, 'Code'), sourceId: str(row, 'SourceId'), group: str(row, 'Group') };
}

function mapForm(row: Row): IntakeForm {
  const patient = (pick(row, 'Patient') ?? {}) as Row;
  const appointment = (pick(row, 'Appointment') ?? {}) as Row;
  const sections: IntakeSection[] = [];
  for (const s of rows(row, 'Sections')) {
    const code = String(pick(s, 'SectionCode')) as SectionCode;
    if (!SECTION_CODES.includes(code)) continue;
    sections.push({
      code,
      label: str(s, 'Name') ?? code,
      routing: pick(s, 'Routing') === 'auto' ? 'auto' : 'review',
      fields: rows(s, 'Fields').map(mapField).filter((f) => f.code && f.label),
      previous: texts(rows(s, 'Previous')),
      chartPayer: code === 'Insurance' ? chartPayer(rows(s, 'Previous')) : undefined,
      catalog: rows(s, 'Catalog').map(mapOption).filter((o) => o.name),
      submittedStatus: str(s, 'SubmittedStatus') ?? null
    });
  }
  const consents: IntakeConsent[] = rows(row, 'Consents').flatMap((c) => {
    const consentFormId = str(c, 'ConsentFormId');
    if (!consentFormId || consentFormId === '0') return [];
    const version = Number(pick(c, 'Version'));
    return [
      {
        consentFormId,
        name: str(c, 'Name') ?? 'Consent form',
        version: Number.isFinite(version) && version > 0 ? version : undefined,
        expiryMonths: Number(pick(c, 'ExpiryMonths')) || 0,
        // Signed FOR THIS VISIT (consent is signed per appointment).
        signed: pick(c, 'Signed') === true
      }
    ];
  });
  return {
    patientId: str(row, 'PatientId') ?? '',
    patient: {
      firstName: str(patient, 'FirstName') ?? '',
      lastName: str(patient, 'LastName') ?? '',
      preferredName: str(patient, 'PreferredName'),
      dateOfBirth: str(patient, 'DateOfBirth') ?? '',
      phone: str(patient, 'Phone')
    },
    appointment: { visitType: str(appointment, 'VisitType'), start: str(appointment, 'Start'), providerName: str(appointment, 'ProviderName') },
    expiresAt: str(row, 'ExpiresAt') ?? '',
    sections,
    consents,
    familyRelations: rows(row, 'FamilyRelations').map((r) => str(r, 'Name') ?? '').filter(Boolean)
  };
}

function mapDrug(row: Row): IntakeDrug {
  return {
    drugId: String(pick(row, 'DrugId')),
    description: str(row, 'Description') ?? '',
    drugName: str(row, 'DrugName'),
    genericName: str(row, 'GenericName'),
    dosage: str(row, 'Dosage'),
    dosageForm: str(row, 'DosageForm'),
    route: str(row, 'Route'),
    rxNorm: str(row, 'RxNorm')
  };
}

function mapPayer(row: Row): IntakePayer {
  return { insurancePlanId: String(pick(row, 'InsurancePlanId')), payerId: String(pick(row, 'PayerId')), name: str(row, 'Name') ?? '', planName: str(row, 'PlanName') };
}

function toBackendValue(value: string | IntakeValue): Row {
  if (typeof value === 'string') return { Text: value };
  const out: Row = { Text: value.text };
  if (value.sourceId) out.SourceId = Number(value.sourceId);
  if (value.payerId) out.PayerId = Number(value.payerId);
  if (value.medication) {
    const m = value.medication;
    out.Medication = {
      DrugId: Number(m.drugId),
      Description: m.description,
      DrugName: m.drugName ?? null,
      GenericName: m.genericName ?? null,
      Dosage: m.dosage ?? null,
      DosageForm: m.dosageForm ?? null,
      Route: m.route ?? null,
      RxNorm: m.rxNorm ?? null
    };
  }
  return out;
}

/** Real portal tokens are 32 random bytes, base64url — exactly 43 characters. */
export function isIntakeToken(token: string | undefined): token is string {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token);
}


// ---- transport -------------------------------------------------------------------------------
// A signed-in portal user goes through the portal's shared client (apiServicesV2). A patient who is
// NOT registered on the portal has no portal token: they authenticate with the intake session they
// got from a one-time code, sent as a Bearer token on a private axios instance. Like the OTP login
// client it has no interceptors, so a 401 here can't clear the portal's storage or raise snackbars.
const withSlash = (url?: string) => (url ? (url.endsWith('/') ? url : `${url}/`) : url);
const sessionClient = axios.create({
  baseURL: withSlash(process.env.NEXT_PUBLIC_APP_API_PATH_V2),
  timeout: 60000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' }
});

/** The intake session to use for this call, or null when the portal sign-in should be used. */
function intakeSessionFor(linkToken?: string): string | null {
  if (hasPortalSession()) return null;
  return linkToken ? getIntakeSession(linkToken) : currentIntakeSession();
}

/** Runs a call as the intake session; throws the response like HttpProvider's request() does. An
 * expired/invalid session (401) is dropped and the page reloaded, which shows the code screen again. */
async function viaSession<T>(call: (auth: { Authorization: string }) => Promise<T>, session: string): Promise<T> {
  try {
    return await call({ Authorization: `Bearer ${session}` });
  } catch (err) {
    const response = (err as { response?: { status?: number } })?.response;
    if (response?.status === 401) {
      clearIntakeSession();
      if (typeof window !== 'undefined') window.location.reload();
    }
    throw response ?? err;
  }
}

function postIntake(linkToken: string, url: string, data: object, portalCall: (d: object) => Promise<unknown>): Promise<{ data?: unknown }> {
  const session = intakeSessionFor(linkToken);
  return (session
    ? viaSession((headers) => sessionClient.post(url, data, { headers }), session)
    : portalCall(data)) as Promise<{ data?: unknown }>;
}

function getZip(zip: string): Promise<{ data?: unknown }> {
  const session = intakeSessionFor();
  return (session
    ? viaSession((headers) => sessionClient.get(`${SERVICE_URLSV2.SmartIntakeSearchZip}?zipCode=${encodeURIComponent(zip)}`, { headers }), session)
    : apiServicesV2.SmartIntakeSearchZip(zip)) as Promise<{ data?: unknown }>;
}

export const intakeApi = {
  /** 404 (IntakeApiError.status) = not available to this account: unknown, expired or revoked
   * link, or one sent to a different patient — deliberately indistinguishable. */
  async getForm(token: string): Promise<IntakeForm> {
    try {
      return mapForm(unwrap(await postIntake(token, SERVICE_URLSV2.SmartIntakeGetForm, { Token: token }, apiServicesV2.SmartIntakeGetForm)) as Row);
    } catch (err) {
      throw toError(err, "We couldn't load your forms right now. Please try again in a few minutes.");
    }
  },

  async submitSection(token: string, code: SectionCode, submission: { attest: true } | { values: (string | IntakeValue)[] }): Promise<void> {
    try {
      await postIntake(token, SERVICE_URLSV2.SmartIntakeSubmitSection, {
        Token: token,
        SectionCode: code,
        Attest: 'attest' in submission,
        Values: 'values' in submission ? submission.values.map(toBackendValue) : []
      }, apiServicesV2.SmartIntakeSubmitSection);
    } catch (err) {
      throw toError(err, "Couldn't save your answers. Please try again.");
    }
  },

  /** For a patient who opened the portal directly: the intake token for one of their appointments
   * (reuses the visit's live link, else the backend issues one). 404 = not available to this account. */
  async getIntakeLink(appointmentId: string | number): Promise<string> {
    try {
      const token = str(unwrap(await apiServicesV2.SmartIntakeGetIntakeLink({ AppointmentId: Number(appointmentId) })) as Row, 'Token');
      if (!isIntakeToken(token)) throw new Error("Your forms aren't available right now.");
      return token;
    } catch (err) {
      throw toError(err, "Your forms aren't available right now. Please contact your practice.");
    }
  },

  /** Marks a consent the patient just signed as signed for this link's appointment. */
  async signConsent(token: string, consentFormId: string, signature: string): Promise<void> {
    try {
      await postIntake(token, SERVICE_URLSV2.SmartIntakeSignConsent, { Token: token, ConsentFormId: Number(consentFormId), Signature: signature }, apiServicesV2.SmartIntakeSignConsent);
    } catch (err) {
      throw toError(err, "Your signature couldn't be saved for this visit. Please try again.");
    }
  },

  async searchDrugs(token: string, query: string): Promise<IntakeDrug[]> {
    try {
      const result = unwrap(await postIntake(token, SERVICE_URLSV2.SmartIntakeSearchDrugs, { Token: token, Query: query }, apiServicesV2.SmartIntakeSearchDrugs));
      return (Array.isArray(result) ? (result as Row[]) : []).map(mapDrug).filter((d) => d.description);
    } catch (err) {
      throw toError(err, "Search isn't available right now. Please try again.");
    }
  },

  /** City/state pairs for a 5-digit ZIP (the EHR's ZipState lookup); empty when it's unknown. */
  async searchZip(zip: string): Promise<{ city: string; state: string }[]> {
    try {
      const result = unwrap(await getZip(zip));
      return (Array.isArray(result) ? (result as Row[]) : []).map((r) => ({ city: str(r, 'City') ?? '', state: str(r, 'State') ?? '' })).filter((r) => r.city && r.state);
    } catch (err) {
      throw toError(err, "ZIP lookup isn't available right now.");
    }
  },

  async searchPayers(token: string, query: string): Promise<IntakePayer[]> {
    try {
      const result = unwrap(await postIntake(token, SERVICE_URLSV2.SmartIntakeSearchPayers, { Token: token, Query: query }, apiServicesV2.SmartIntakeSearchPayers));
      return (Array.isArray(result) ? (result as Row[]) : []).map(mapPayer).filter((p) => p.name);
    } catch (err) {
      throw toError(err, "Search isn't available right now. Please try again.");
    }
  }
};
