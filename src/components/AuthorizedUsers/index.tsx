import { useState, useEffect } from 'react';
import React from 'react';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AuthorizedUserHeader from '@/components/AuthorizedUsers/components/Header';
import AuthorisedUsersList from '@/components/AuthorizedUsers/components/AuthorisedUsersList';
import HeartProgressLoader from '@/components/ProgressLoaders/components/HeartLoader';
import { useDispatch } from '@/store/index';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import { GetPatientAuthorizedUser } from '@/slices/patientprofileslice';

const AuthorizedUserData = () => {
  const [heartLoading, setHeartLoading] = useState(true);
    const dispatch = useDispatch();
  const { patientId, practiceId } = useCurrentPatient();

 
  useEffect(() => {
    if (!patientId || !practiceId) return;
    dispatch(GetPatientAuthorizedUser({ 
      PatientId: patientId, 
      PracticeId: practiceId 
    }));
  }, [patientId, practiceId]);
   
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
              height: 'calc(98vh - 60px)'
            }}
            tabIndex={3}
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