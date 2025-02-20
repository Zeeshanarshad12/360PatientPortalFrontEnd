"use client";
import React, { useEffect, useState } from "react";
import { LocalStorageCache } from "@auth0/auth0-react";
import { setToken } from "@/utils/functions";

const GetToken = () => {
  const [showChild, setShowChild] = useState(false);
  
  // useEffect(() => {
  //   setShowChild(true);
  // }, []);
  
  // const getToken = async () => {
  //   const refresh_token = new LocalStorageCache();
  //   const key =
  //     refresh_token.allKeys().find((key) => key.includes("auth0spa")) ?? "";
  //   const token_item = localStorage.getItem(key) ?? "";

  //   if (token_item) {
  //     try {
  //       const token_item_body = JSON.parse(token_item);
  //       if (token_item_body && token_item_body.body) {
  //         setToken(token_item_body.body.access_token);
  //         localStorage.setItem(
  //           "refresh_token",
  //           token_item_body.body.refresh_token
  //         );
  //       } else {
  //         console.error("Malformed token data:", token_item_body);
  //       }
  //     } catch (error) {
  //       console.error("Error parsing token from localStorage:", error);
  //     }
  //   } else {
  //     setToken("Test");
  //     console.error("No token found in localStorage for key:", key);
  //   }
  // };

  const getToken = async () => {
    const refresh_token = new LocalStorageCache();
    const key =
      refresh_token.allKeys().find((key) => key.includes("auth0spa")) ?? "";
    const token_item = localStorage.getItem(key) ?? "";
    const token_item_body = JSON.parse(token_item);
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