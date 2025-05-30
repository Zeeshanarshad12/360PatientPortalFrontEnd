import {
  CardContent,
  Typography,
  Avatar,
  Grid,
  Divider
} from '@mui/material';
import React from 'react';
import { useSelector } from "@/store/index";
import { BsTypeH3 } from 'react-icons/bs';

function ContactInfo() {
  const { PatientDetailsById } = useSelector((state) => state.patientprofileslice);
  const patientDetails = PatientDetailsById?.item1[0];

  return (
    <CardContent>
      {/* Main section heading */}
      <Typography variant="h3" component="h2" fontWeight="bold">
        Profile
      </Typography>
      <Divider sx={{ marginY: 2 }} />

      <Grid container spacing={2} alignItems="center">
        <Grid item component="h3">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: '#1976d2',
              color: 'white',
              fontSize: '24px'
            }}
            component="h3"
          >
            {patientDetails?.firstName.charAt(0)}
            {patientDetails?.lastName.charAt(0)}
          </Avatar>
        </Grid>
        <Grid item>
          {/* Name styled as heading */}
          <Typography component="h3" fontWeight="bold" color="primary" fontSize="18px">
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
          {/* Section label as heading */}
          <Typography sx={{ marginBottom: 1 }} variant="subtitle2" component="h4">
            Practice
          </Typography>
          <Typography fontWeight="bold" component="h5">
            {patientDetails?.practiceName}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography sx={{ marginBottom: 1 }} variant="subtitle2" component="h4">
            ACO Name
          </Typography>
          <Typography fontWeight="bold" component="h5">
            {patientDetails?.acO_Name}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography sx={{ marginBottom: 1 }} variant="subtitle2" component="h4">
            Physician Name
          </Typography>
          <Typography fontWeight="bold" component="h5">
            {patientDetails?.physicianName}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default ContactInfo;