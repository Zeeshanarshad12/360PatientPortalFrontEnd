import React from 'react';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AuthorizedUserHeader from '@/components/AuthorizedUsers/components/Header';
import AuthorisedUsersList from '@/components/AuthorizedUsers/components/AuthorisedUsersList';

const AuthorizedUserData = () => {
  return (
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
  );
};

export default AuthorizedUserData;