import { CardContent, Typography, Grid, Divider } from '@mui/material';
import React from 'react';
import { useSelector } from '@/store/index';

function Contacts() {
  const { PatientDetailsById } = useSelector(
    (state) => state.patientprofileslice
  );
  const patientContact = Array.isArray(PatientDetailsById?.item2)
    ? PatientDetailsById.item2
    : [];
  const patientEmailAddress = PatientDetailsById?.item1[0];

  const contactMap = patientContact.reduce((acc, contact) => {
    acc[contact.text] = contact.phoneNumber;
    return acc;
  }, {});

  const contactDetailsInfo = {
    'mobile': contactMap?.Mobile,
    'home': contactMap?.Home,
    'work': contactMap?.Work,
    'email': patientEmailAddress?.peEmailAddress,
    'current address': patientEmailAddress?.patientAddress
  };

  return (
    <CardContent>
      <Typography variant="h6" fontWeight="bold" color="primary">
        Contact
      </Typography>
      <Divider sx={{ marginY: 2 }} />

      <Grid container spacing={2}>
        {Object.entries(contactDetailsInfo).map(([key, value]) => (
          <Grid item xs={ key == 'current address' ? 6 : 3 } key={key}>
            <Typography sx={{ marginBottom: 1 }} variant="subtitle2">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Typography>
            <Typography fontWeight="bold">{value}</Typography>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  );
}

export default Contacts;