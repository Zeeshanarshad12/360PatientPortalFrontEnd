"use client";
import React, { useContext } from "react";
import { Box, Drawer, useTheme, useMediaQuery, styled } from "@mui/material";
import { SidebarContext } from "../../../contexts/SidebarContext";
import SidebarMenu from "./SidebarMenu";

const StyledDrawerPaper = styled(Box)(({ theme }) => ({
  background: '#FFFFFF',
  color: theme.palette.text.primary,
  borderRadius: '0',
  border: 'none',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  overflow: 'hidden',
}));

function Sidebar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarToggle, closeSidebar } = useContext(SidebarContext);

  const sidebarWidth = 280;

  const sidebarStyles = {
    width: sidebarWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: sidebarWidth,
      boxSizing: 'border-box',
      background: '#FFFFFF',
      border: 'none',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    },
  };

  // Mobile: Use temporary drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        anchor="left"
        open={sidebarToggle}
        onClose={closeSidebar}
        sx={{
          ...sidebarStyles,
          '& .MuiDrawer-paper': {
            ...sidebarStyles['& .MuiDrawer-paper'],
            zIndex: theme.zIndex.drawer + 2,
          },
        }}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        <StyledDrawerPaper sx={{ height: '100%', overflow: 'auto' }}>
          <SidebarMenu onItemClick={closeSidebar} />
        </StyledDrawerPaper>
      </Drawer>
    );
  }

  // Desktop: Use permanent drawer
  return (
    <Drawer
      variant="permanent"
      sx={{
        ...sidebarStyles,
        '& .MuiDrawer-paper': {
          ...sidebarStyles['& .MuiDrawer-paper'],
          position: 'fixed',
          zIndex: theme.zIndex.drawer,
        },
      }}
    >
      <StyledDrawerPaper sx={{ height: '100%', overflow: 'auto' }}>
        <SidebarMenu />
      </StyledDrawerPaper>
    </Drawer>
  );
}

export default Sidebar;
