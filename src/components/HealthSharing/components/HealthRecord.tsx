import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useHealthRecordLoadState } from '@/components/HealthSharing/contexts/healthRecordLoadStates';
import { useEncounterLoadState } from '@/components/HealthSharing/contexts/encounterLoadStates';
import EncounterListData from '@/components/HealthSharing/components/EncounterList';
import EncounterDetailsReport from '@/components/HealthSharing/components/EncounterDetails';

function HealthRecordData() {
  const { isHealthRecordLoad, setIsHealthRecordLoad } =
    useHealthRecordLoadState();
  const { isEncounterLoad, setIsEncounterLoad } = useEncounterLoadState();

  return (
    <>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {isHealthRecordLoad ? (
          <Box sx={{ padding: 2 }}>
            {!isEncounterLoad ? (
              <>
                <EncounterListData />
              </>
            ) : (
              <>
                <EncounterDetailsReport />
              </>
            )}
          </Box>
        ) : (
          <Card
            sx={{
              height: '60vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <EventNoteIcon sx={{ fontSize: 60, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                Select Date to view Record
              </Typography>
            </CardContent>
          </Card>
        )}
      </Card>
    </>
  );
}

export default HealthRecordData;