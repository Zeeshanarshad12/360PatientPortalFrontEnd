// hooks/useAuth.js
import { useAuth0 } from '@auth0/auth0-react';

export function useAccessToken() {
  const { getAccessTokenSilently } = useAuth0();
  return getAccessTokenSilently();
}

export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth0();
  return isAuthenticated;
}

export function useRefreshToken() {
  const { getAccessTokenSilently } = useAuth0();
  return getAccessTokenSilently({ ignoreCache: true });
}

export function useLogout() {
  const { logout } = useAuth0();
  return logout;
}
