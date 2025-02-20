"use client";
import { useEffect, useState } from "react";
import { instance } from "@/services/HttpProvider";
import { useAuth0 } from "@auth0/auth0-react";
import { setToken } from "@/utils/functions";
import ForbiddenModal from "./ForbiddenModal";
import { ClearCahceNLogout } from "@/slices/static";
import { useDispatch } from "@/store";

const AxiosInterceptor = ({ children }) => {
  const { getAccessTokenSilently, logout } = useAuth0();
  const [ShowModal, setShowModal] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const excludedAPIs = ["activitylogs/getactivitylog"];

    let apiURL = "";

    instance.interceptors.response.use(
      async (response) => {
        return response;
      },
      async (error) => {
        if (error.config) {
          apiURL = error.config.url;
        }

        const originalRequest = error.config;
        if (error.response.status === 403) {
          if (excludedAPIs.includes(apiURL)) {
            return;
          } else {
            setShowModal(true);
          }
        }
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const accessToken = await getAccessTokenSilently({
              ignoreCache: true,
            });
            setToken(accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return instance(originalRequest);
          } catch {
            dispatch(ClearCahceNLogout());
            setTimeout(() => {
              localStorage.clear();
              logout({ returnTo: process.env.NEXT_PUBLIC_ORIGIN_URI });
            }, 500);
          }
        }

        throw error;
      }
    );
  }, [dispatch, getAccessTokenSilently, logout]);

  if (ShowModal) {
    return <ForbiddenModal logout={logout} />;
  } else {
    return children;
  }
};

export default instance;
export { AxiosInterceptor };
