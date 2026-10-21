/**
 * One-time-code sign-in API client.
 *
 * Deliberately NOT built on HttpProvider's request()/requestWithoutToken():
 *  - requestWithoutToken() rewrites the default headers of every shared axios instance (it would
 *    strip Authorization app-wide), and
 *  - Check_Authentication() raises snackbars and, on 401, clears localStorage.
 * Neither belongs in an anonymous sign-in flow, so this module owns a private axios instance that
 * no interceptor is attached to.
 *
 * Security: the identifier and the code only ever travel in POST bodies (never a query string),
 * and nothing in this module logs a request or response.
 *
 * Contract (all wrapped in the AutoWrapper envelope { result, message, isError, responseException }):
 *   POST loginotp/start  { identifier }            -> OtpStartResult
 *   POST loginotp/send   { challengeId, channel }  -> OtpSendResult
 *   POST loginotp/verify { challengeId, code }     -> OtpSignInResult (same shape as GetToken)
 * Errors: 400 with responseException.exceptionMessage.code = OTP_INVALID | OTP_EXPIRED |
 *         OTP_LOCKED | OTP_CHALLENGE_INVALID | RESEND_NOT_AVAILABLE, and 429 when rate limited.
 */
import axios from 'axios';
import { SERVICE_URLS_OTP_LOGIN } from './ServiceUrl';

export type OtpChannel = 'email' | 'sms';

export interface OtpChannelOption {
  channel: OtpChannel;
  maskedDestination: string;
}

export interface OtpStartResult {
  challengeId: string;
  // true only when the account has both an email and an SMS-capable mobile. Otherwise the server
  // has already sent (or, for no match, pretended to send) a code and the user goes straight to
  // code entry, so "no account" and "single-channel account" look identical (AC-2).
  requiresChannelSelection: boolean;
  channels: OtpChannelOption[];
  expiresInSeconds?: number;
  resendAvailableInSeconds?: number;
}

export interface OtpSendResult {
  expiresInSeconds?: number;
  resendAvailableInSeconds?: number;
}

// Mirrors the result of GET patientuser/gettoken so the session is identical to a password one.
export interface OtpSignInResult {
  access_token: string;
  refresh_token?: string;
  Email?: string;
  FirstName?: string;
  LastName?: string;
  UserAccessType?: string;
  PracticeName?: string;
  PatientID?: string | number;
  PracticeID?: string | number;
  vdtAccess?: string;
}

export type OtpErrorCode =
  | 'OTP_INVALID'
  | 'OTP_EXPIRED'
  | 'OTP_LOCKED'
  | 'OTP_CHALLENGE_INVALID'
  | 'RESEND_NOT_AVAILABLE'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'UNKNOWN';

export class OtpLoginError extends Error {
  code: OtpErrorCode;
  attemptsRemaining?: number;
  retryAfterSeconds?: number;

  constructor(
    code: OtpErrorCode,
    attemptsRemaining?: number,
    retryAfterSeconds?: number
  ) {
    super(code);
    this.name = 'OtpLoginError';
    this.code = code;
    this.attemptsRemaining = attemptsRemaining;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// OTP endpoints live under the newest API version. Point NEXT_PUBLIC_APP_API_PATH_OTP at it
// (e.g. .../api/v3/) when one is published; until then the v2 base is used. Never v1.
const withTrailingSlash = (url?: string) =>
  url ? (url.endsWith('/') ? url : `${url}/`) : url;

const otpInstance = axios.create({
  baseURL: withTrailingSlash(
    process.env.NEXT_PUBLIC_APP_API_PATH_OTP ||
      process.env.NEXT_PUBLIC_APP_API_PATH_V2
  ),
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

const KNOWN_CODES: OtpErrorCode[] = [
  'OTP_INVALID',
  'OTP_EXPIRED',
  'OTP_LOCKED',
  'OTP_CHALLENGE_INVALID',
  'RESEND_NOT_AVAILABLE',
  'RATE_LIMITED'
];

const toOtpError = (error: any): OtpLoginError => {
  const response = error?.response;
  if (!response) return new OtpLoginError('NETWORK');

  const retryAfterHeader = Number(response.headers?.['retry-after']);
  const retryAfter = Number.isFinite(retryAfterHeader)
    ? retryAfterHeader
    : undefined;

  if (response.status === 429) {
    return new OtpLoginError('RATE_LIMITED', undefined, retryAfter);
  }

  // AutoWrapper puts a custom error object under responseException.exceptionMessage.
  const body = response.data ?? {};
  const detail =
    body?.responseException?.exceptionMessage ?? body?.result ?? body;
  const code = String(detail?.code ?? detail?.errorCode ?? '').toUpperCase();
  const attempts = Number(detail?.attemptsRemaining);

  return new OtpLoginError(
    (KNOWN_CODES as string[]).includes(code)
      ? (code as OtpErrorCode)
      : 'UNKNOWN',
    Number.isFinite(attempts) ? attempts : undefined,
    retryAfter
  );
};

const postOtp = async <T>(url: string, body: object): Promise<T> => {
  try {
    const res = await otpInstance.post(url, body);
    return (res?.data?.result ?? res?.data) as T;
  } catch (error) {
    throw toOtpError(error);
  }
};

export const startOtpLogin = (identifier: string) =>
  postOtp<OtpStartResult>(SERVICE_URLS_OTP_LOGIN.Start, { identifier });

// channel is omitted on a resend when no destination was chosen; the server then uses the channel
// the challenge is already bound to.
export const sendOtpCode = (challengeId: string, channel?: OtpChannel) =>
  postOtp<OtpSendResult>(
    SERVICE_URLS_OTP_LOGIN.Send,
    channel ? { challengeId, channel } : { challengeId }
  );

export const verifyOtpCode = (challengeId: string, code: string) =>
  postOtp<OtpSignInResult>(SERVICE_URLS_OTP_LOGIN.Verify, {
    challengeId,
    code
  });

// ---- Smart Intake link sign-in (patient NOT registered on the portal) ----
//   POST loginotp/intake/start  { token }                -> OtpStartResult   (code goes to the contact details on the chart)
//   POST loginotp/send          { challengeId, channel } -> OtpSendResult    (shared with the sign-in flow)
//   POST loginotp/intake/verify { challengeId, code }    -> OtpIntakeSessionResult

export interface OtpIntakeSessionResult {
  intakeSessionToken: string;
  expiresInSeconds: number;
}

export const startIntakeOtp = (token: string) =>
  postOtp<OtpStartResult>(SERVICE_URLS_OTP_LOGIN.IntakeStart, { token });

export const verifyIntakeOtp = (challengeId: string, code: string) =>
  postOtp<OtpIntakeSessionResult>(SERVICE_URLS_OTP_LOGIN.IntakeVerify, {
    challengeId,
    code
  });
