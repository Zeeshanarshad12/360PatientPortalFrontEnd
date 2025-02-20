import React, { useState } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import Report from '@mui/icons-material/Report';
import { DataGrid } from '@mui/x-data-grid';
import { useActivityLoadState } from '@/components/HealthSharing/contexts/activityLoadStates';
import { useSelector } from '@/store/index';

function ActivityLogData ()  {
  const { PatientCCDAActivityLog } = useSelector((state) => state.patientprofileslice);
  const activityDatarows = PatientCCDAActivityLog?.result.item3;
  const { isActivityLoad, setIsActivityLoad } = useActivityLoadState();
  const activityData = {
    columns: [
      // { field: 'id', headerName: 'ID', hide: true, flex: 1 },
      { field: 'activityDate', headerName: 'Date & Time', flex: 1 },
      { field: 'userName', headerName: 'User Name (Patient Portal)', flex: 1 },
      { field: 'module', headerName: 'Module', flex: 1 },
      { field: 'activityType', headerName: 'Activity (Action Performed)', flex: 1 },
      { field: 'userEmail', headerName: 'Email Address', flex: 1 }
    ],
   // Dynamically populate rows from the activityDatarows
   rows: activityDatarows ? activityDatarows.map((item, index) => ({
    id: index + 1, // Unique ID for each row, using index + 1
    activityDate: new Date(item.activityDate).toLocaleString(), // Convert activityDate to local string format
    userName: item.userName,
    module: item.module,
    activityType: item.activityType,
    userEmail: item.userEmail
  })) : [] // Fallback to empty array if activityDatarows is null or undefined
 
  };

  return (
    <>
      <Card
        sx={{
          height: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {isActivityLoad ? (
          <Box sx={{ height: '100%', width: '100%', padding: 1 }}>
            <DataGrid
              rows={activityData.rows}
              columns={activityData.columns}
              autoPageSize
              pageSize={5}
              sx={{
                '.MuiDataGrid-columnSeparator': {
                  display: 'none'
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#ededeb',
                  fontStyle: 'italic'
                },
                boxShadow: 2
              }}
            />
          </Box>
        ) : (
          <CardContent sx={{ textAlign: 'center' }}>
            <Report sx={{ fontSize: 60, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              No Activity Found
            </Typography>
          </CardContent>
        )}
      </Card>
    </>
  );
};

export default ActivityLogData;