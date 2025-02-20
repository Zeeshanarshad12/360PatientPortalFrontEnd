import React, { FC, ReactNode } from "react";
import { Box } from "@mui/material";
import PropTypes from "prop-types";
import Sidebar from "./Sidebar";
import Header from "./Header";
interface CollapsedSidebarLayoutProps {
  children?: ReactNode;
}
const CollapsedSidebarLayout: FC<CollapsedSidebarLayoutProps> = ({
  children,
}) => {
  return (
    <>
      <Box
        id="main-app"
        sx={{
          display: "flex",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Sidebar />

        <Box
          id="app-content"
          sx={{
            flexGrow: 1,
          }}
        >
          <Header />

          <Box id="app-com-content">{children}</Box>
        </Box>
      </Box>
    </>
  );
};

CollapsedSidebarLayout.propTypes = {
  children: PropTypes.node,
};

export default CollapsedSidebarLayout;
