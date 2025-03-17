import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useHealthRecordLoadState } from '@/components/HealthSharing/contexts/healthRecordLoadStates';
import { useEncounterLoadState } from '@/components/HealthSharing/contexts/encounterLoadStates';
import { GetPatientEncounterDetails } from '@/slices/patientprofileslice';
import { useDispatch, useSelector } from '@/store/index';
// import moment from 'moment';
import moment from 'moment-timezone';

function HealthRecordFilter() {
  const dispatch = useDispatch();
  const [filterType, setFilterType] = useState('allData');
  const [fromDate, setFromDate] = useState(moment().format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));

  const { isHealthRecordLoad, setIsHealthRecordLoad } =
    useHealthRecordLoadState();
  const { isEncounterLoad, setIsEncounterLoad } = useEncounterLoadState();
  const { PatientEncounterData } = useSelector(
    (state) => state.patientprofileslice
  );

  const obj = {
    PatientId: localStorage.getItem('patientID'),
    dateflag: true,
    datefrom: fromDate,
    dateto: toDate
  };

   useEffect(() => {
        if (localStorage.getItem('patientID') != null) {
         
          getPatientencountersClick();
        }
      }, [dispatch]);

  const getPatientencountersClick = () => {

    setIsEncounterLoad(false);
    setIsHealthRecordLoad(true);

    if (filterType === 'dateRange') {
      obj.dateflag = true;
    } else {
      obj.dateflag = false;
    }

    obj.datefrom = moment(fromDate).tz('America/New_York').format('YYYY-MM-DD HH:mm:ss');
    obj.dateto = moment(toDate).tz('America/New_York').format('YYYY-MM-DD HH:mm:ss');
    dispatch(GetPatientEncounterDetails(obj));
  };
  return (
    <>
      <Card sx={{ marginY: 2 }}>
        <CardContent>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2">{'\u00A0'}</Typography>
              <RadioGroup
                row
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <FormControlLabel
                  value="allData"
                  control={<Radio />}
                  label="All of my data"
                />
                <FormControlLabel
                  value="dateRange"
                  control={<Radio />}
                  label="Date Range"
                />
              </RadioGroup>
            </Grid>

            {filterType === 'dateRange' && (
              <>
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    From Date {'\u00A0'}
                  </Typography>
                  <DatePicker
                    value={fromDate}
                    onChange={(newValue) =>
                      setFromDate(
                        moment(new Date(newValue)).format('YYYY-MM-DD')
                      )
                    }
                    renderInput={(params) => (
                      <TextField {...params} size="small" />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    To Date {'\u00A0'}
                  </Typography>
                  <DatePicker
                    value={toDate}
                    onChange={(newValue) =>
                      setToDate(moment(new Date(newValue)).format('YYYY-MM-DD'))
                    }
                    renderInput={(params) => (
                      <TextField {...params} size="small" />
                    )}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="subtitle2">{'\u00A0'}</Typography>
              <Button
                variant="contained"
                sx={{ borderRadius: '5px' }}
                onClick={getPatientencountersClick}
              >
                Apply
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}

export default HealthRecordFilter;