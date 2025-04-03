import React, { useState, useEffect } from 'react';
import { Typography, Button, Grid, Divider } from '@mui/material';
import { useEncounterLoadState } from '@/components/HealthSharing/contexts/encounterLoadStates';
import { useDispatch, useSelector } from '@/store/index';
import moment from 'moment';
import {
  GetPatientCCDADetail,
  GetPatientCCDADetailCCDF,
  InsertActivityLog,
  setEncounterId
} from '@/slices/patientprofileslice';
import EncounterDetailsReport from  '@/components/HealthSharing/components/EncounterDetails';
import { debug } from 'console';
import { Email } from '@mui/icons-material';

function EncounterListData() {
  const dispatch = useDispatch();

  const { isEncounterLoad, setIsEncounterLoad } = useEncounterLoadState();
  const [encounterID, setEncounterID] = useState(null);
  const [loader, setLoader] = useState(true);
  const { PatientEncounterData,InsertActivityLogData } = useSelector(
    (state) => state.patientprofileslice
  );

  const handleViewEncounterDoc = (encounterID) => {
    setIsEncounterLoad(true);
    const CCDAobjHRF = {
      encounterID: encounterID,
      humanReadable: true
    };
    dispatch(GetPatientCCDADetail(CCDAobjHRF));
    const CCDAobjCCDF = {
      encounterID: encounterID,
      humanReadable: false
    };
    dispatch(GetPatientCCDADetailCCDF(CCDAobjCCDF));

    //Save ActivityLog on View
    const Logobj = {
      PatientId: localStorage.getItem('patientID'),
      Email : localStorage.getItem('Email'), 
      ActivityTypeId: '2'
    };
    dispatch(InsertActivityLog(Logobj));

    dispatch(setEncounterId(encounterID));
  };
  return (
    <>
   <Typography variant="body1" fontWeight="bold" sx={{ marginBottom: 2 }}>
  {PatientEncounterData?.length}{" "}
  {PatientEncounterData?.length === 1 ? "visit found" : "visits found"}, 
  please select a visit to see details.
  </Typography>

      {PatientEncounterData?.map((visit) => (
        <React.Fragment key={visit.id}>
          <Grid
            key={visit.id}
            container
            alignItems="center"
            justifyContent="space-between"
            sx={{ marginBottom: 2 }}
          >
            <Grid item>
              <Typography variant="body1" color="primary" fontWeight="bold">
                {moment(visit.encounterDateTime).format('MM/DD/YYYY')}
              </Typography>
              <Typography variant="body2">
                {visit.provider} | Location: {visit.locationName}
              </Typography>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                size="small"
                sx={{ borderRadius: '5px' }}
                onClick={() => handleViewEncounterDoc(visit.id)}
              >
                View
              </Button>
            </Grid>
          </Grid>
          <Divider sx={{ marginY: 2 }} />
        </React.Fragment>
      ))}
    </>
  );
}

export default EncounterListData;