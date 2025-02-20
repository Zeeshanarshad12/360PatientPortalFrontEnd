import {
  CardContent,
  Typography,
  Avatar,
  Grid,
  Divider
} from '@mui/material';
import React from 'react';
import { useSelector } from "@/store/index";

function ContactInfo() {
  const { PatientDetailsById } = useSelector((state) => state.patientprofileslice);
  const patientDetails = PatientDetailsById?.item1[0];

  return (
    <CardContent>
      <Typography variant="h3" fontWeight="bold">
        Contact Info
      </Typography>
      <Divider sx={{ marginY: 2 }} />

      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: '#1976d2',
              color: 'white',
              fontSize: '24px'
            }}
          >
            {patientDetails?.firstName.charAt(0)}
            {patientDetails?.lastName.charAt(0)}
          </Avatar>
        </Grid>
        <Grid item>
          <Typography fontWeight="bold" color="primary" fontSize="18px">
            {patientDetails?.prefix + '. ' + patientDetails?.firstName +
              ' ' +
              patientDetails?.lastName}
          </Typography>
          <Typography>
            DOB: {patientDetails?.dateOfBirth}, {patientDetails?.age} years old {patientDetails?.birthSex}
          </Typography>
          <Typography>
            MRN: {patientDetails?.mrn}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={5}>
          <Typography sx={{ marginBottom: 1 }} variant="subtitle2">
            Practice
          </Typography>
          <Typography fontWeight="bold">
            {patientDetails?.practiceName}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ marginBottom: 1 }} variant="subtitle2">
            ACO Name
          </Typography>
          <Typography fontWeight="bold">
            {patientDetails?.acO_Name}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography sx={{ marginBottom: 1 }} variant="subtitle2">
            Physician Name
          </Typography>
          <Typography fontWeight="bold">
            {patientDetails?.physicianName}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default ContactInfo;