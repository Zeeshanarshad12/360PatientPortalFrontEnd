"use client";
import React, { ReactNode } from "react";
import { Auth0Provider } from "@auth0/auth0-react";

interface AuthProviderProps {
  children: ReactNode
}
const AuthProvider = ({ children }: AuthProviderProps) => {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_DOMAIN}
      clientId={process.env.NEXT_PUBLIC_CLIENTID}
      useRefreshTokens
      cacheLocation="localstorage"
      audience={process.env.NEXT_PUBLIC_AUDIENCE}
      redirectUri={process.env.NEXT_PUBLIC_REDIRECTURI}
      scope="profile email create:patientvitals"
    >
      {children}
    </Auth0Provider>
  );
};

export default AuthProvider;
