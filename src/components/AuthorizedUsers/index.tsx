import { useState, useEffect } from 'react';
import React from 'react';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AuthorizedUserHeader from '@/components/AuthorizedUsers/components/Header';
import AuthorisedUsersList from '@/components/AuthorizedUsers/components/AuthorisedUsersList';
import HeartProgressLoader from '@/components/ProgressLoaders/components/HeartLoader';

const AuthorizedUserData = () => {
  const [heartLoading, setHeartLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeartLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {heartLoading ? (
        <HeartProgressLoader />
      ) : (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box
            sx={{
              flexGrow: 1,
              padding: 1,
              overflowY: 'auto',
              height: 'calc(100vh - 100px)'
            }}
          >
            <AuthorizedUserHeader></AuthorizedUserHeader>
            <AuthorisedUsersList></AuthorisedUsersList>
          </Box>
        </LocalizationProvider>
      )}
    </>
  );
};

export default AuthorizedUserData;