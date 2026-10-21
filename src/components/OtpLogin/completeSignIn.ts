import Router from 'next/router';
import { setToken } from '@/utils/functions';
import { takePostLoginRedirect } from '@/utils/postLoginRedirect';
import type { OtpSignInResult } from '@/services/otpLoginService';

/**
 * Establishes the portal session from a verified one-time code. Performs exactly the steps the
 * password GetToken thunk performs (patientprofileslice), so everything downstream — the session
 * refresher, the header patient switcher (driven by the stored Email), logout — behaves the same.
 * Keep the two in sync.
 */
export const completeOtpSignIn = (result: OtpSignInResult) => {
  setToken(
    result.access_token,
    result.Email,
    result.FirstName,
    result.LastName,
    result.UserAccessType,
    result.PracticeName,
    result.PatientID,
    result.PracticeID,
    result.vdtAccess
  );

  if (result.refresh_token) {
    localStorage.setItem('refresh_token', result.refresh_token);
  }

  Router.push(takePostLoginRedirect() ?? '/patientportal/dashboard');
};
