import {
  CardContent,
  Typography,
  Grid,
  Divider
} from '@mui/material';
import React from 'react';
import { useSelector } from "@/store/index";

function Demographics() {
  const { PatientDetailsById } = useSelector((state) => state.patientprofileslice);
  const patientDemographics = Array.isArray(PatientDetailsById?.item1) ? PatientDetailsById?.item1[0] : {};

  const patientDemographicsData = {
    'Race': patientDemographics?.race,
    'Ethnicity': patientDemographics?.ethnicity,
    'Sexual Orientation': patientDemographics?.sexualOrientation,
    'Gender Identity': patientDemographics?.genderIdentity,
    'Sex Assigned at Birth': patientDemographics?.sexassignedatBirth,
    'Marital Status': patientDemographics?.maritalStatus,
    'Birth Order': patientDemographics?.birthOrder,
    'Preferred Language': patientDemographics?.preferredLanguage,
    'Occupation': patientDemographics?.occupation,
    'Occupation Industry': patientDemographics?.occupationIndustry,
    'Tribal Affiliation': patientDemographics?.tribalAffiliation
  };

  return (
    <CardContent>
      <Typography variant="h6" component="h2" fontWeight="bold" color="primary">
        Demographics
      </Typography>
      <Divider sx={{ marginY: 2 }} />

      <Grid container spacing={2}>
        {Object.entries(patientDemographicsData).map(([key, value]) => (
          <Grid item xs={(key === 'Occupation' || key === 'Occupation Industry' || key === 'Tribal Affiliation') ? 12 : 6} md={3} key={key}>
            <Typography sx={{ marginBottom: 1 }} variant="subtitle2" component="h5">
              {key}
            </Typography>
            <Typography fontWeight="bold" component="h5">{value}</Typography>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  );
};

export default Demographics;
