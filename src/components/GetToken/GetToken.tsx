"use client";
import React, { useEffect, useState } from "react";
import { LocalStorageCache } from "@auth0/auth0-react";
import { setToken } from "@/utils/functions";

const GetToken = () => {
  const [showChild, setShowChild] = useState(false);
  
  

  const getToken = async () => {
  const refresh_token = new LocalStorageCache();
  const key =
    refresh_token.allKeys().find((key) => key.includes("auth0spa")) ?? "";

  if (!key) {
    // No Auth0 SPA key yet – nothing to do
    return;
  }

  const token_item = localStorage.getItem(key);
  if (!token_item) {
    // No token stored for this key – nothing to do
    return;
  }

  let token_item_body: any;
  try {
    token_item_body = JSON.parse(token_item);
  } catch {
    // Malformed JSON – don’t crash the app
    return;
  }

  if (!token_item_body?.body) {
    return;
  }

  setToken(token_item_body.body.access_token);
  localStorage.setItem("refresh_token", token_item_body.body.refresh_token);
};

  React.useEffect(() => {
    // if (showChild) {
    //   setTimeout(() => {
    //     getToken();
    //   }, 500);
    //   getToken();
    // }
    getToken();
  }, []);

  return <></>;
};

export default GetToken;