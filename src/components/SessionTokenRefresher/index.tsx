import { useEffect, useRef } from 'react';
import { refreshAccessToken } from '@/services/HttpProvider';
import { store, persistor } from '@/store';
import { clearPatientSession, getTokenExpiryMs } from '@/utils/functions';

const CHECK_INTERVAL_MS = 30 * 1000;
const REFRESH_BEFORE_EXPIRY_MS = 2 * 60 * 1000; // refresh ~2 min before the access token actually expires

/* No real user activity for this long forces a logout, even if the token could still be
 refreshed. Without this, silently refreshing on a timer regardless of activity would feed
 Auth0's refresh token "last used" clock forever, defeating any inactivity policy Auth0 has
 configured - idle expiry has to be enforced here, not assumed to happen server-side.
*/
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'wheel',
  'touchstart',
  'scroll'
];

/* Keeps the session alive for active users by silently exchanging the Auth0 refresh_token
 for a new access_token shortly before the current one expires. If the user has been
 genuinely idle, we log out instead of refreshing. If a refresh attempt ever fails (no
 refresh_token, or Auth0 rejects it), the session really is over, so we log out too.
*/
const SessionTokenRefresher = () => {
  const refreshingRef = useRef(false);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const logout = () => {
      if (!localStorage.getItem('token')) return;

      localStorage.clear();
      store.dispatch({ type: 'RESET_ALL_STATE' });
      persistor.purge();
      clearPatientSession();
      window.location.href = process.env.NEXT_PUBLIC_ORIGIN_URI;
    };

    const checkSession = async () => {
      if (refreshingRef.current) return;

      const token = localStorage.getItem('token');
      if (!token) return;

      if (Date.now() - lastActivityRef.current >= IDLE_TIMEOUT_MS) {
        logout();
        return;
      }

      const expiryMs = getTokenExpiryMs(token);
      if (!expiryMs) return;

      if (Date.now() >= expiryMs - REFRESH_BEFORE_EXPIRY_MS) {
        refreshingRef.current = true;
        const newAccessToken = await refreshAccessToken();
        refreshingRef.current = false;

        if (!newAccessToken) {
          logout();
        }
      }
    };

    markActivity();
    ACTIVITY_EVENTS.forEach((eventName) =>
      window.addEventListener(eventName, markActivity, { passive: true })
    );

    checkSession();
    const interval = setInterval(checkSession, CHECK_INTERVAL_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) =>
        window.removeEventListener(eventName, markActivity)
      );
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default SessionTokenRefresher;
