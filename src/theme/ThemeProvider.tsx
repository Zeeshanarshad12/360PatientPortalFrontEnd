"use client";
/* eslint-disable */

import { FC, useState, createContext, useEffect, ReactNode } from "react";
import { ThemeProvider } from "@mui/material";
import { themeCreator } from "./base";
import { StylesProvider } from "@mui/styles";

export const ThemeContext = createContext((themeName: string): void => { });

interface ThemeProviderWrapperProps {
  children: ReactNode;
}

const ThemeProviderWrapper: FC<ThemeProviderWrapperProps> = ({ children }) => {
  const [themeName, setThemeName] = useState("PureLightTheme");

  useEffect(() => {
    const curThemeName =
      window.localStorage.getItem("appTheme") || "PureLightTheme";
    setThemeName(curThemeName);
  }, []);

  const theme = themeCreator(themeName);
  const handleThemeName = (themeName: string): void => {
    window.localStorage.setItem("appTheme", themeName);
    setThemeName(themeName);
  };

  return (
    <StylesProvider injectFirst>
      <ThemeContext.Provider value={handleThemeName}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </ThemeContext.Provider>
    </StylesProvider>
  );
};

export default ThemeProviderWrapper;
