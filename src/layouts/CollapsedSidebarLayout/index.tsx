import React, { FC, ReactNode, useContext } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import PropTypes from "prop-types";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { SidebarContext } from "../../contexts/SidebarContext";

interface CollapsedSidebarLayoutProps {
  children?: ReactNode;
}

const CollapsedSidebarLayout: FC<CollapsedSidebarLayoutProps> = ({
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarToggle } = useContext(SidebarContext);

  return (
    <>
      <Box
        id="main-app"
        sx={{
          display: "flex",
          height: "100vh",
          position: "relative",
        }}
      >
        <Sidebar />

        <Box
          id="app-content"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            marginLeft: {
              xs: 0, // No margin on mobile - sidebar is overlay
              md: "10px" // Fixed margin on desktop for sidebar space
            },
            transition: theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Header />

          <Box 
            id="app-com-content"
            sx={{
              flexGrow: 1,
              overflow: "hidden",
              paddingTop: "52px", // Account for fixed header height
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
};

CollapsedSidebarLayout.propTypes = {
  children: PropTypes.node,
};

export default CollapsedSidebarLayout;
