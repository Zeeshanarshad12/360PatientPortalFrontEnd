import React from 'react';
import { Typography, Button, Grid } from '@mui/material';
import { useActivityLogState } from '@/components/HealthSharing/contexts/activityLogStates';
import { useActivityLoadState } from '@/components/HealthSharing/contexts/activityLoadStates';
import { useHealthRecordLoadState } from '@/components/HealthSharing/contexts/healthRecordLoadStates';

const HealthRecordHeader = () => {
  const { isActivityLog, setIsActivityLog } = useActivityLogState();
  const { isActivityLoad, setIsActivityLoad } = useActivityLoadState();
  const { isHealthRecordLoad, setIsHealthRecordLoad } = useHealthRecordLoadState();

  const handleSwitchViewClick = () => {
    setIsActivityLog(!isActivityLog);
    setIsActivityLoad(false);
    setIsHealthRecordLoad(false);
  };

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold">
          {isActivityLog ? 'Activity Log' : 'My Health Record'}
        </Typography>
        <Button
          variant={isActivityLog ? 'contained' : 'outlined'}
          sx={{ textTransform: 'none', borderRadius: '5px' }}
          onClick={handleSwitchViewClick}
        >
          {isActivityLog ? 'Back to My Health Record' : 'Activity Log'}
        </Button>
      </Grid>
    </>
  );
};

export default HealthRecordHeader;