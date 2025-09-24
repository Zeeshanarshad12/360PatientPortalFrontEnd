'use client';
import React, { FC, ReactNode } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Sidebar from './CollapsedSidebarLayout/Sidebar';
import Header from './CollapsedSidebarLayout/Header';
import { useAuth0 } from '@auth0/auth0-react';
import ThemeLoader from '@/components/ThemeComponent/ThemeLoader';
interface CollapsedSidebarLayoutProps {
  children?: ReactNode;
}
const SharedLayout: FC<CollapsedSidebarLayoutProps> = ({ children }) => {
  // const { isAuthenticated, isLoading } = useAuth0();
  const token = localStorage.getItem('token');
  // if (token) {
  //   return <ThemeLoader loader={isLoading} />;
  // }
  if (token) {
    return (
      <>
        <Box
          id="main-app"
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100vh',
            overflow: 'hidden'
          }}
        >
          <Sidebar />

          <Box
            id="app-content"
            sx={{
              flexGrow: 1
            }}
          >
            <Header />
            <Box
              id="app-com-content"
              sx={{
                marginLeft: '5px'
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </>
    );
  } else {
    return (
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          height: '100%'
        }}
      >
        {children}
      </Box>
    );
  }
};

SharedLayout.propTypes = {
  children: PropTypes.node
};

export default SharedLayout;