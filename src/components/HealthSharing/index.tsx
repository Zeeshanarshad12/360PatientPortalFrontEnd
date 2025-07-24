import React from 'react';
import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useActivityLogState } from '@/components/HealthSharing/contexts/activityLogStates';
import HealthRecordHeader from '@/components/HealthSharing/components/Header';
import HealthRecordFilter from '@/components/HealthSharing/components/HealthRecordFilters';
import ActivityLogFilter from '@/components/HealthSharing/components/ActivityLogFilters';
import HealthRecordData from '@/components/HealthSharing/components/HealthRecord';
import ActivityLogData from '@/components/HealthSharing/components/ActivityLog';
import HeartProgressLoader from '@/components/ProgressLoaders/components/HeartLoader';

const HealthSharingData = () => {
  const [heartLoading, setHeartLoading] = useState(true);
  const { isActivityLog } = useActivityLogState();

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeartLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {heartLoading ? (
        <HeartProgressLoader />
      ) : (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box
            sx={{
              flexGrow: 1,
              padding: 1,
              overflowY: 'auto',
              height: 'calc(100vh - 100px)'
            }}
          >
            <HealthRecordHeader></HealthRecordHeader>
            {!isActivityLog ? <HealthRecordFilter /> : <ActivityLogFilter />}
            {!isActivityLog ? <HealthRecordData /> : <ActivityLogData />}
          </Box>
        </LocalizationProvider>
      )}
    </>
  );
};

export default HealthSharingData;