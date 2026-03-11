import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, Box, Typography, Switch } from '@mui/material';
import Report from '@mui/icons-material/Report';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector, useDispatch } from '@/store/index';
import { UpdatePatientAuthorizedUserAccess, GetPatientAuthorizedUser } from '@/slices/patientprofileslice';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';

function AuthorisedUsersList() {
  const dispatch = useDispatch();
  const { GetPatientAuthorizedUserData } = useSelector((state) => state.patientprofileslice);
  const activityDatarows = GetPatientAuthorizedUserData?.result;

  const [toggleStates, setToggleStates] = useState([]);
  const [togglePHIStates, setTogglePHIStates] = useState([]);

  const { patientId, practiceId } = useCurrentPatient();

 
  useEffect(() => {
    if (!activityDatarows) return;
    setToggleStates(activityDatarows.map((item) => item.accessStatus?.trim() === 'Active'));
    setTogglePHIStates(activityDatarows.map((item) => item.vdtAccess?.trim() === 'Active'));
  }, [activityDatarows]);

  
  const handleToggle = useCallback(async (id, rowid) => {
    setToggleStates((prev) => {
      const updated = [...prev];
      updated[rowid] = !updated[rowid];
      return updated;
    });

    const newState = !toggleStates[rowid];
    const AccessObj = {
      index: id,
      PatientId: patientId,
      PracticeId: practiceId,
      vdtAccess: '',
      isActive: newState ? 'Active' : 'Inactive',
    };

    try {
      await dispatch(UpdatePatientAuthorizedUserAccess(AccessObj)).unwrap();
    
    } catch (error) {
      console.error("Error updating access status:", error);
     
      setToggleStates((prev) => {
        const rolled = [...prev];
        rolled[rowid] = !rolled[rowid];
        return rolled;
      });
    }
  }, [dispatch, patientId, toggleStates]);

  const handlePHIToggle = useCallback(async (id, rowid) => {
    setTogglePHIStates((prev) => {
      const updated = [...prev];
      updated[rowid] = !updated[rowid];
      return updated;
    });

    const newState = !togglePHIStates[rowid];
    const AccessObj = {
      index: id,
      PatientId: patientId,
      vdtAccess: newState ? 'Active' : 'Inactive',
      isActive: '',
    };

    try {
      await dispatch(UpdatePatientAuthorizedUserAccess(AccessObj)).unwrap();
    } catch (error) {
      console.error("Error updating PHI access status:", error);
    
      setTogglePHIStates((prev) => {
        const rolled = [...prev];
        rolled[rowid] = !rolled[rowid];
        return rolled;
      });
    }
  }, [dispatch, patientId, togglePHIStates]);

  const columns = [
    { field: 'Name', headerName: 'Name', flex: 1 },
    { field: 'EmailAddress', headerName: 'Email Address', flex: 1 },
    { field: 'Relationship', headerName: 'Relationship', flex: 1 },
    { field: 'AccessProvidedOn', headerName: 'Access Provided On', flex: 1 },
    {
      field: 'AccessStatus', headerName: 'Access Status', flex: 1,
      renderCell: (params) => {
        const rowid = params.row.rowid;
        return (
          <Switch
            id={`switchAuth-${params.row.id}`}
            checked={toggleStates[rowid] ?? false}
            onChange={() => handleToggle(params.row.id, rowid)}
            inputProps={{ 'aria-label': 'Enable/Disable Access' }}
          />
        );
      }
    },
    {
      field: 'vdtAccess', headerName: 'Access PHI', flex: 1,
      renderCell: (params) => {
        const rowid = params.row.rowid;
        return (
          <Switch
            id={`switchPHI-${params.row.id}`}
            checked={togglePHIStates[rowid] ?? false}
            onChange={() => handlePHIToggle(params.row.id, rowid)}
            inputProps={{ 'aria-label': 'Enable/Disable PHI Access' }}
          />
        );
      }
    }
  ];

  const rows = activityDatarows?.map((item, index) => ({
    rowid: index,
    id: item.id,
    Name: item.authUserName,
    EmailAddress: item.emailAddress,
    Relationship: item.relationship,
    AccessProvidedOn: item.accessProvidedOn,
    AccessStatus: item.accessStatus,
    AccessPHI: item.vdtAccess,
  })) ?? [];

  return (
    <>
      <Card sx={{ marginY: 2, backgroundColor: 'rgba(96, 148, 185, 0.16)', boxShadow: 2, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            Allow a trusted family member, caregiver, or another person to help manage your health information through the patient portal.
            When you add someone, they will receive an invitation by email.
          </Typography>
        </CardContent>
      </Card>
      <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {activityDatarows ? (
          <Box sx={{ height: '100%', width: '100%', padding: 1 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              autoPageSize
              pageSize={10}
              sx={{
                '.MuiDataGrid-columnSeparator': { display: 'none' },
                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#ededeb', fontStyle: 'italic' },
                boxShadow: 2,
              }}
            />
          </Box>
        ) : (
          <CardContent sx={{ textAlign: 'center' }}>
            <Report sx={{ fontSize: 60, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">No Activity Found</Typography>
          </CardContent>
        )}
      </Card>
    </>
  );
}

export default AuthorisedUsersList;