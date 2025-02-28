import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import { useActivityLoadState } from '@/components/HealthSharing/contexts/activityLoadStates';
import { useDispatch, useSelector } from "@/store/index";
import { GetPatientCCDAActivityLog } from '@/slices/patientprofileslice';
import moment from 'moment';

function ActivityLogFilter () {
   const dispatch = useDispatch();
   const { isActivityLoad, setIsActivityLoad } = useActivityLoadState();
   const { PatientCCDAActivityLog } = useSelector((state) => state.patientprofileslice);
   

    const activityOptions = PatientCCDAActivityLog?.result.item1;
    const dateRangeOptions = PatientCCDAActivityLog?.result.item2;
    const [activityValue, setActivityValue] = useState('1');
    const [dateRangeValue, setDateRangeValue] = useState('1');
    const LogObj = {
      PatientId : localStorage.getItem('patientID'),
      Activity : activityValue,
      Daterange : dateRangeValue
    }
    const handleActivityChange = (event: any) => {
    setActivityValue(event.target.value);
    LogObj.Activity=activityValue;
     };


    const handleDateRangeChange = (event: any) => {
      
    setDateRangeValue(event.target.value);
    LogObj.Daterange=dateRangeValue;
  };
 
  const getLogReport = () => {
    setIsActivityLoad(true);
    if (localStorage.getItem('patientID') != null) {
 
      dispatch(GetPatientCCDAActivityLog(LogObj));
    }
  };

     useEffect(() => {
      if (localStorage.getItem('patientID') != null) {
       
        dispatch(GetPatientCCDAActivityLog(LogObj));
        setIsActivityLoad(true);
      }
    }, [dispatch]);
  return (
    <>
      <Card sx={{ marginY: 2 }}>
        <CardContent>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle2" fontWeight="bold">
                Activity
              </Typography>
              <FormControl fullWidth sx={{ height: '100%' }}>
                <Select
                  value={activityValue}
                  onChange={handleActivityChange}
                  sx={{ height: '40px' }}
                >
                  {activityOptions?.map((option) => (
                    <MenuItem key={option.activityTypeID} value={option.activityTypeID}>
                      {option.activityType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle2" fontWeight="bold">
                Date Range
              </Typography>
              <FormControl fullWidth sx={{ height: '100%' }}>
                <Select
                  value={dateRangeValue}
                  onChange={handleDateRangeChange}
                  sx={{ height: '40px' }}
                >
                  {dateRangeOptions?.map((option) => (
                    <MenuItem key={option.dateRangeID} value={option.dateRangeID}>
                      {option.dateRange}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2">{'\u00A0'}</Typography>
              <Button
                variant="contained"
                sx={{ borderRadius: '5px' }}
                // onClick={() => setIsActivityLoad(true)}
                onClick={getLogReport}
              >
                Get Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};

export default ActivityLogFilter;