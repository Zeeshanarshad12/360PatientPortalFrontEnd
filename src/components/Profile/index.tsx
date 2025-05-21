import React, { useEffect } from 'react';
import { Box, Card, CircularProgress, Typography } from '@mui/material';
import ContactInfo from '@/components/Profile/components/ContactInfo';
import Contacts from '@/components/Profile/components/Contacts';
import Insurance from '@/components/Profile/components/Insurance';
import Demographics from '@/components/Profile/components/Demographics';
import { usePatientDataLoadState } from '@/components/Profile/contexts/patientDataLoadStates';
import { useDispatch, useSelector } from "@/store/index";
import { GetPatientDetailsById } from "@/slices/patientprofileslice";
import CircularProgressLoader from '@/components/ProgressLoaders/components/Circular';

const PatientProfile = () => {
  const { isPatientDataLoad, setIsPatientDataLoad } = usePatientDataLoadState();

  const dispatch = useDispatch();
  const { PatientByEmailData, PatientDetailsById } = useSelector((state) => state.patientprofileslice);

  const patient = PatientByEmailData?.[0];

  useEffect(() => {
    if (localStorage.getItem('patientID') != null) {
      dispatch(GetPatientDetailsById(localStorage.getItem('patientID')));
    }
  }, [localStorage.getItem('patientID'), dispatch]);

  useEffect(() => {
    if (PatientDetailsById?.item1) {
      setIsPatientDataLoad(true);
    }
  }, [PatientDetailsById?.item1]);

  return (
    <>
      {!isPatientDataLoad ? (
        <CircularProgressLoader />
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            padding: 1,
            overflowY: 'auto',
            height: 'calc(100vh - 100px)'
          }}
          tabIndex={0} 
        >
          <Card sx={{ marginBottom: 1 }}>
            <ContactInfo></ContactInfo>
          </Card>

          <Card sx={{ marginBottom: 1 }} >
            <Contacts></Contacts>

            <Insurance></Insurance>

            <Demographics></Demographics>
          </Card>
        </Box>
      )}
    </>
  );
};

export default PatientProfile;