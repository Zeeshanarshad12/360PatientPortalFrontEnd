"use client";
import { useEffect, useState } from "react";
import { instance } from "@/services/HttpProvider";
import { useAuth0 } from "@auth0/auth0-react";
import { setToken } from "@/utils/functions";
import ForbiddenModal from "./ForbiddenModal";
import { ClearCahceNLogout } from "@/slices/static";
import { useDispatch } from "@/store";
import { useRouter } from "next/navigation";
import { log } from "console";

const AxiosInterceptor = ({ children }) => {
  const { getAccessTokenSilently, logout } = useAuth0();
  const [ShowModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const excludedAPIs = ["activitylogs/getactivitylog"];
    let apiURL = "";
debugger;
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
        debugger;
        if (error.response.status == 401) {
          originalRequest._retry = true;
          try {
            
            // alert(originalRequest._retry +" "+error.response.status);
            // const accessToken = await getAccessTokenSilently({
            //   ignoreCache: true,
            // });
            // setToken(accessToken);
            // originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            // return instance(originalRequest);
            // router.push("/");
          } catch {
            // dispatch(ClearCahceNLogout());
            setTimeout(() => {
              // localStorage.clear();
              // logout({ returnTo: process.env.NEXT_PUBLIC_ORIGIN_URI });
            }, 500);
          }
        }

        throw error;
      }
    );
  }, [dispatch]);

  if (ShowModal) {
    return <ForbiddenModal logout={logout} />;
  } else {
    return children;
  }
};

export default instance;
export { AxiosInterceptor };
