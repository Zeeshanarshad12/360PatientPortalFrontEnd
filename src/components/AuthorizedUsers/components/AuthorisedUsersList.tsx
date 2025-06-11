import React, { useState, useEffect } from 'react';
import { Card, CardContent, Box, Typography, Switch } from '@mui/material';
import Report from '@mui/icons-material/Report';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector, useDispatch } from '@/store/index';
import { UpdatePatientAuthorizedUserAccess, GetPatientAuthorizedUser } from '@/slices/patientprofileslice';

function AuthorisedUsersList() {
  const dispatch = useDispatch();
  const { GetPatientAuthorizedUserData } = useSelector((state) => state.patientprofileslice);
  const activityDatarows = GetPatientAuthorizedUserData?.result;
  const isActivityLoad = true;

  // Maintain the toggle state for each row (based on AccessStatus)
  const [toggleStates, setToggleStates] = useState([]);
  const [togglePHIStates, setTogglePHIStates] = useState([]);

  useEffect(() => {
    if (activityDatarows) {
      // Initialize toggle states based on AccessStatus from data
      const initialStates = activityDatarows.map((item) => item.accessStatus.trim() === "Active");
      setToggleStates(initialStates);
      const initialPHIStates = activityDatarows.map((item) => item.vdtAccess?.trim() === "Active");
      setTogglePHIStates(initialPHIStates);
    }
  }, [activityDatarows]);

  // Handle toggle switch changes
  const handleToggle = async (index, rowid) => {
    const updatedStates = [...toggleStates];
    // Toggle the state for this particular row
    updatedStates[rowid] = !updatedStates[rowid];
    setToggleStates(updatedStates);

    // Set the AccessObj with the correct isActive value
    const isActive = updatedStates[rowid] ? 'Active' : 'Inactive';

    const AccessObj = {
      index: index, // use index for backend identification if needed
      PatientId: localStorage.getItem('patientID'),
      vdtAccess: '',
      isActive: isActive, // Updated status
    };

    try {
      // Dispatch the action to update the backend with the AccessObj data
      // debugger;
      const response = await dispatch(UpdatePatientAuthorizedUserAccess(AccessObj)).unwrap();

      // Optionally refetch the updated user data after toggling the status
      if (localStorage.getItem('patientID') != null) {
        dispatch(GetPatientAuthorizedUser(localStorage.getItem('patientID')));
      }
    } catch (error) {
      console.error("Error updating the user's access status:", error);
    }
  };

    const handlePHIToggle = async (index, rowid) => {
    const updatedStates = [...togglePHIStates];
    updatedStates[rowid] = !updatedStates[rowid];
    setTogglePHIStates(updatedStates);

    const isActive = updatedStates[rowid] ? 'Active' : 'Inactive';

    const AccessObj = {
      index: index,
      PatientId: localStorage.getItem('patientID'),
      vdtAccess: isActive,
      isActive: ''
    };

    try {
      await dispatch(UpdatePatientAuthorizedUserAccess(AccessObj)).unwrap();
      if (localStorage.getItem('patientID') != null) {
        dispatch(GetPatientAuthorizedUser(localStorage.getItem('patientID')));
      }
    } catch (error) {
      console.error("Error updating PHI access status:", error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('patientID') != null) {
      dispatch(GetPatientAuthorizedUser(localStorage.getItem('patientID')));
    }
  }, [dispatch]);

  const activityData = {
    columns: [
      { field: 'Name', headerName: 'Name', flex: 1 },
      { field: 'EmailAddress', headerName: 'Email Address', flex: 1 },
      { field: 'Relationship', headerName: 'Relationship', flex: 1 },
      { field: 'AccessProvidedOn', headerName: 'Access Provided On', flex: 1 },
      { field: 'AccessStatus', headerName: 'Access Status', flex: 1,
        renderCell: (params) => {
          const rowid = params.row.rowid; // Use rowid from the row data
          const isActive = toggleStates[rowid]; // Fetch the correct state for this row
          const isDisabled = false; //localStorage.getItem("UserAccessType") !== "Self"; // condition for disabling switch

          return (
            <Switch
              id={`switchAuth-${params.row.id}`} // Unique ID for the switch""
              checked={isActive}
              onChange={() => handleToggle(params.row.id, rowid)} // Pass correct indices to handleToggle
              disabled={isDisabled}
              sx={{
                '& .MuiSwitch-thumb': {
                  backgroundColor: isDisabled ? 'rgba(0, 0, 0, 0.38)' : '', // Dim the thumb color when disabled
                },
                '& .MuiSwitch-track': {
                  backgroundColor: isDisabled ? 'rgba(0, 0, 0, 0.12)' : '', // Dim the track color when disabled
                },
                // When the switch is disabled, apply the custom opacity and color
                '&.Mui-disabled': {
                  opacity: 0.5, // Dim the opacity when disabled
                  color: 'rgba(0, 0, 0, 0.38)', // Dim the main color of the switch
                },
              }}
              inputProps={{ 'aria-label': 'Enable/Disable Access' }}
            />
          );
        }
      },
      { field: 'vdtAccess', headerName: 'Access PHI', flex: 1,
        renderCell: (params) => {
          const rowid = params.row.rowid;
          const isActive = togglePHIStates[rowid];

          return (
            <Switch
              id={`switchPHI-${params.row.id}`}
              checked={isActive}
              onChange={() => handlePHIToggle(params.row.id, rowid)}
              inputProps={{ 'aria-label': 'Enable/Disable PHI Access' }}
            />
          );
        }
      }
    ],
    rows: activityDatarows ? activityDatarows.map((item, index) => ({
      rowid: index, // Use rowid as the index to identify rows uniquely
      id: item.id,  // The actual ID for backend or unique row identification
      Name: item.authUserName,
      EmailAddress: item.emailAddress,
      Relationship: item.relationship,
      AccessProvidedOn: item.accessProvidedOn,
      AccessStatus: item.accessStatus, // This can be used to show the initial status if needed
      AccessPHI: item.vdtAccess,
    })) : []
  };

  return (
    <>
      <Card sx={{ marginY: 2, backgroundColor: 'rgba(96, 148, 185, 0.16)', boxShadow: 2, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            Allow a trust family member, caregiver, or another person to help manage your health information through the patient portal.
            When you add someone, they will receive an invitation by email.
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {isActivityLoad ? (
          <Box sx={{ height: '100%', width: '100%', padding: 1 }}>
            <DataGrid
              rows={activityData.rows}
              columns={activityData.columns}
              autoPageSize
              pageSize={10}
              sx={{
                '.MuiDataGrid-columnSeparator': { display: 'none' },
                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#ededeb', fontStyle: 'italic' },
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