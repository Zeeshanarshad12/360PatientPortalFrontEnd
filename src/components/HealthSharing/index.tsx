import React from 'react';
import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useActivityLogState } from '@/components/HealthSharing/contexts/activityLogStates';
import { useEncounterLoadState } from '@/components/HealthSharing/contexts/encounterLoadStates';
import HealthRecordHeader from '@/components/HealthSharing/components/Header';
import HealthRecordFilter from '@/components/HealthSharing/components/HealthRecordFilters';
import ActivityLogFilter from '@/components/HealthSharing/components/ActivityLogFilters';
import HealthRecordData from '@/components/HealthSharing/components/HealthRecord';
import ActivityLogData from '@/components/HealthSharing/components/ActivityLog';
import HeartProgressLoader from '@/components/ProgressLoaders/components/HeartLoader';
import { SIDEBAR_ACTIVE_ITEM_RECLICK_EVENT } from '@/utils/navigationEvents';

const HealthSharingData = () => {
  const [heartLoading, setHeartLoading] = useState(true);
  const { isActivityLog, setIsActivityLog } = useActivityLogState();
  const { setIsEncounterLoad } = useEncounterLoadState();

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeartLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleReclick = () => {
      // Re-clicking "My Health Record" while already on this page should
      // take the user back to the visit list, out of an encounter/activity log detail view.
      setIsEncounterLoad(false);
      setIsActivityLog(false);
    };

    window.addEventListener(SIDEBAR_ACTIVE_ITEM_RECLICK_EVENT, handleReclick);
    return () =>
      window.removeEventListener(
        SIDEBAR_ACTIVE_ITEM_RECLICK_EVENT,
        handleReclick
      );
  }, [setIsEncounterLoad, setIsActivityLog]);

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
              height: 'calc(98vh - 60px)'
            }}
            tabIndex={2}
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