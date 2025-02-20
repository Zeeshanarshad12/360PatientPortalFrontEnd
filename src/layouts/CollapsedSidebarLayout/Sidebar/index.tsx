"use client";
import React from "react";

import { Box, styled } from "@mui/material";

import SidebarMenu from "./SidebarMenu";

const SidebarWrapper = styled(Box)(
  ({ theme }) => `

        // width: ${theme.spacing(8.4)};
        // color: ${theme.sidebar.textColor};
        // background: ${theme.sidebar.background};
        // box-shadow: ${theme.sidebar.boxShadow};  
        // // box-shadow: '0px 3px 4px #00000029';  
        // height: 100%;

        // @media (min-width: ${theme.breakpoints.values.md}px) {
        //   top: 0;
        //   left: 0;
        //   position: fixed;
        //   // z-index: 10;
        //   // border-top-right-radius: 30px;
        //   // border-bottom-right-radius: 30px;
        // }
`
);

function Sidebar() {
  return (
    <React.Fragment>
      <SidebarWrapper
        id="app-sidebar"
        sx={{
          background: "#FFFFFF",

          position: "fixed",
          top: 0,
          bottom: 0,
          // width: '55px'
        }}
      >
        <Box>
          <SidebarMenu />
        </Box>
      </SidebarWrapper>
    </React.Fragment>
  );
}

export default Sidebar;
