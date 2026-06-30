'use client';
import { useEffect, useState } from 'react';
import {
  instance,
  PPSERVICEInstance,
  instanceV2,
  instanceEligibility,
  instanceEMR,
  refreshAccessToken
} from '@/services/HttpProvider';
import ForbiddenModal from './ForbiddenModal';
import { store, persistor } from '@/store';
import { clearPatientSession } from '@/utils/functions';

const ALL_INSTANCES = [
  instance,
  PPSERVICEInstance,
  instanceV2,
  instanceEligibility,
  instanceEMR
];

const performLogout = () => {
  localStorage.clear();
  store.dispatch({ type: 'RESET_ALL_STATE' });
  persistor.purge();
  clearPatientSession();
  window.location.href = process.env.NEXT_PUBLIC_ORIGIN_URI;
};

const AxiosInterceptor = ({ children }) => {
  const [ShowModal, setShowModal] = useState(false);

  useEffect(() => {
    const excludedAPIs = ['activitylogs/getactivitylog'];

    const interceptorIds = ALL_INSTANCES.map((axiosInstance) =>
      axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
          const apiURL = error.config?.url ?? '';
          const originalRequest = error.config;

          if (error.response?.status === 403) {
            if (!excludedAPIs.includes(apiURL)) {
              setShowModal(true);
            }
            throw error;
          }

          if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry
          ) {
            originalRequest._retry = true;
            const newAccessToken = await refreshAccessToken();
            if (newAccessToken) {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${newAccessToken}`
              };
              return axiosInstance(originalRequest);
            }

            // No refresh_token, or Auth0 rejected it (expired/revoked) - session is over.
            performLogout();
          }

          throw error;
        }
      )
    );

    return () => {
      ALL_INSTANCES.forEach((axiosInstance, idx) =>
        axiosInstance.interceptors.response.eject(interceptorIds[idx])
      );
    };
  }, []);

  if (ShowModal) {
    return <ForbiddenModal logout={performLogout} />;
  } else {
    return children;
  }
};

export default instance;
export { AxiosInterceptor };
