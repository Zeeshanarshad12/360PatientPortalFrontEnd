import { useEffect, useState } from 'react';
import { Box, Alert, CircularProgress, Button } from '@mui/material';
import Router from 'next/router';
import apiServicesV2 from '@/services/requestHandler';
import { setToken, getTokenIssuer } from '@/utils/functions';
import axios from 'axios';

// AuthenticateUserWithToken returns Email as "", but the dashboard looks the patient up by
// email (GetPatientByEmail), so read it from Auth0's /userinfo using the same access token.
const fetchEmail = async (accessToken: string): Promise<string> => {
  const issuer = getTokenIssuer(accessToken);
  if (!issuer) return '';
  try {
    const { data } = await axios.get(`${issuer}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return data?.email ?? '';
  } catch {
    return '';
  }
};

/**
 * Entry point for the mobile app's WebView. The app signs the patient in against Auth0
 * natively, then opens:
 *
 *   <portal>/auth/mobile#access_token=<jwt>&refresh_token=<token>
 *
 * The tokens travel in the URL fragment so they are never sent to a server or written to
 * access logs. This page exchanges them for the patient session through
 * AuthenticateUserWithToken (same session the normal sign-in creates), then opens the
 * dashboard on this same origin.
 */
const MobileLogin = () => {
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      // Drop the tokens from the address bar / history straight away.
      window.history.replaceState(null, '', window.location.pathname);

      if (!accessToken) {
        setError('Missing sign-in token.');
        return;
      }

      try {
        const res: any = await apiServicesV2.AuthenticateUserWithToken({
          JwtToken: accessToken,
          RefreshToken: refreshToken || null
        });
        let result = res?.data?.result ?? res?.data;
        if (typeof result === 'string') result = JSON.parse(result);

        if (!result?.access_token) {
          setError(result?.error_description || 'Unable to sign in.');
          return;
        }

        const email = result.Email || (await fetchEmail(result.access_token));
        if (!email) {
          setError('Unable to load your account email. Please try again.');
          return;
        }

        localStorage.clear();
        setToken(
          result.access_token,
          email,
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

        // Relative route -> stays on the host the WebView loaded, never localhost.
        await Router.replace('/patientportal/dashboard');
      } catch (err: any) {
        const status = err?.response?.status;
        console.error('[auth/mobile] AuthenticateUserWithToken failed', status, err);
        setError(
          status === 401
            ? 'Sign-in token was rejected (401). Check the token audience/issuer.'
            : status
            ? `Unable to sign in (HTTP ${status}).`
            : 'Unable to reach the server. Check the API URL and certificate.'
        );
      }
    };
    run();
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3
      }}
    >
      {error ? (
        <>
          <Alert severity="error">{error}</Alert>
          <Button variant="contained" onClick={() => Router.replace('/')}>
            Go to sign in
          </Button>
        </>
      ) : (
        <CircularProgress />
      )}
    </Box>
  );
};

export default MobileLogin;
