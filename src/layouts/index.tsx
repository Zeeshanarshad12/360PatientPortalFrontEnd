'use client';
import React, { FC, ReactNode, useEffect } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Sidebar from './CollapsedSidebarLayout/Sidebar';
import Header from './CollapsedSidebarLayout/Header';
import { useAuth0 } from '@auth0/auth0-react';
import ThemeLoader from '@/components/ThemeComponent/ThemeLoader';
import { useDispatch, useSelector } from '@/store';
import { GetPatientByEmail } from '@/slices/patientprofileslice';
interface CollapsedSidebarLayoutProps {
  children?: ReactNode;
}
const SharedLayout: FC<CollapsedSidebarLayoutProps> = ({ children }) => {
  // const { isAuthenticated, isLoading } = useAuth0();
  const token = localStorage.getItem('token');
  const dispatch = useDispatch();
   const { PatientByEmailData, patientEmail } = useSelector(
     (state) => state.patientprofileslice
   );

   useEffect(() => {
     if (typeof window === 'undefined') return;

     const email = localStorage.getItem('Email');
     const token = localStorage.getItem('token');
     if (!email || !token) return;

     const hasPatients =
       Array.isArray(PatientByEmailData) && PatientByEmailData.length > 0;
     const sameUser = patientEmail && patientEmail === email;

     // If we already have data for this email, don't refetch
     if (hasPatients && sameUser) return;

     // Exactly one fetch per user per session
     dispatch(GetPatientByEmail(email));
   }, [dispatch, PatientByEmailData, patientEmail]);
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