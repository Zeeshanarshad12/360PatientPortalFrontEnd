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
    mobile: contactMap?.Mobile,
    home: contactMap?.Home,
    work: contactMap?.Work,
    email: patientEmailAddress?.peEmailAddress,
    'current address': patientEmailAddress?.patientAddress
  };

  return (
    <CardContent>
      <Typography variant="h6" component="h2" fontWeight="bold" color="primary">
        Contact
      </Typography>
      <Divider sx={{ marginY: 2 }} />

      <Grid container spacing={2}>
        {Object.entries(contactDetailsInfo).map(([key, value]) => (
          <Grid item xs={key === 'current address' ? 6 : 3} key={key}>
            {/* Label uses heading semantics */}
            <Typography sx={{ marginBottom: 1 }} variant="subtitle2" component="h4">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Typography>

            {/* Value uses paragraph semantics with fallback and clickable links */}
            <Typography variant="body2" component="h6" fontWeight="bold">
              {value ? (
                key === 'email' ? (
                  <a href={`mailto:${value}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {value}
                  </a>
                ) : (key !== 'current address') ? (
                  <a href={`tel:${value.replace(/\D/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {value}
                  </a>
                ) : (
                  value
                )
              ) : (
                'N/A'
              )}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  );
}

export default Contacts;
