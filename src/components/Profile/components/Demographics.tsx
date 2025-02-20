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
    'race': patientDemographics?.race,
    'ethnicity': patientDemographics?.ethnicity,
    'sexual Orientation': patientDemographics?.sexualOrientation,
    'gender Identity': patientDemographics?.genderIdentity,
    'Sex Assigned at Birth': patientDemographics.sexassignedatBirth,
    'marital Status': patientDemographics?.maritalStatus,
    'birth Order': patientDemographics?.birthOrder,
    'occupation': patientDemographics?.occupation,
    'Occupation Industry' : patientDemographics.occupationIndustry,
    'tribal Affiliation': patientDemographics?.tribalAffiliation,
    'preferred Language': patientDemographics?.preferredLanguage
  };

  return (
    <CardContent>
      <Typography variant="h6" fontWeight="bold" color="primary">
        Demographics
      </Typography>
      <Divider sx={{ marginY: 2 }} />

      <Grid container spacing={2}>
        {Object.entries(patientDemographicsData).map(([key, value]) => (
          <Grid item xs={3} key={key}>
            <Typography sx={{ marginBottom: 1 }} variant="subtitle2">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Typography>
            <Typography fontWeight="bold">{value}</Typography>
          </Grid>
        ))}
      </Grid>
    </CardContent>
  );
};

export default Demographics;