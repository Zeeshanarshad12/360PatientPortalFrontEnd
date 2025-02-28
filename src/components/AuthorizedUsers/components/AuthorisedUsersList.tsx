import React, { useState } from 'react';
import { Card, CardContent, Box, Typography, Switch} from '@mui/material';
import Report from '@mui/icons-material/Report';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector } from '@/store/index';


function AuthorisedUsersList() {
  const { PatientCCDAActivityLog } = useSelector((state) => state.patientprofileslice);
  const activityDatarows = PatientCCDAActivityLog?.result.item3;
  const isActivityLoad = true;

  // State to manage the toggle status for each row
  const [toggleStates, setToggleStates] = useState(
    activityDatarows ? activityDatarows.map(() => false) : []
  );

  // Function to handle toggle state change
  const handleToggle = (index) => {
    const newToggleStates = [...toggleStates];
    newToggleStates[index] = !newToggleStates[index];
    setToggleStates(newToggleStates);
  };

  const activityData = {
    columns: [
      { field: 'name', headerName: 'Name', flex: 1 },
      { field: 'emailAddress', headerName: 'Email Address', flex: 1 },
      { field: 'relationship', headerName: 'Relationship', flex: 1 },
      { field: 'accessProvidedOn', headerName: 'Access Provided On', flex: 1 },
      { field: 'accessStatus', headerName: 'Access Status', flex: 1 },
      { field: 'toggleAccess', headerName: 'Toggle Access', flex: 1,
        renderCell: (params) => {
          // Get the toggle state from the parent state (toggleStates)
          const index = params.row.id - 1; // Get the index of the row (since IDs start from 1)
          const isToggled = toggleStates[index];

          return (
            <Switch
              checked={isToggled}
              onChange={() => handleToggle(index)}
            />
          );
        }
      }
    ],
    rows: [
      {
        id:1,
        name: "John Doe",
        emailAddress: "john.doe@example.com",
        relationship: "Family",
        accessProvidedOn: "2025-01-15 10:00:00",
        accessStatus: "Active",
        toggleAccess: true,
      },
      {
        id:2,
        name: "Jane Smith",
        emailAddress: "jane.smith@example.com",
        relationship: "Caregiver",
        accessProvidedOn: "2025-02-01 14:30:00",
        accessStatus: "Inactive",
        toggleAccess: false,
      },
      {
        id:3,
        name: "Robert Johnson",
        emailAddress: "robert.johnson@example.com",
        relationship: "Friend",
        accessProvidedOn: "2024-12-20 09:00:00",
        accessStatus: "Active",
        toggleAccess: true,
      }
    ]
  };



  return (
    <>
   <Card sx={{ 
      marginY: 2, 
      backgroundColor: 'rgba(96, 148, 185, 0.16)', // Light grey background
      boxShadow: 2, // Optional: Add slight shadow for a floating effect
      borderRadius: 2, // Optional: Rounded corners for the card
    }}>
      <CardContent>
        <Typography variant="h6"  fontWeight="bold">
          Allow a trust family member, caregiver, or another person to help manage your health information through the patient portal.
          When you add someone, they will receive an invitation by email or text message.
        </Typography>
      </CardContent>
    </Card>
      <Card
        sx={{
          height: '70vh',
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
}

export default AuthorisedUsersList;
