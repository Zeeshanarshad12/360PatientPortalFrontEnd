import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {
  CircularProgress,
  Card,
  CardContent,
  Box,
  Button,
  Grid,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  TextField,
  Snackbar,
  Alert,
  Switch,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  AlertColor
} from '@mui/material';
import { useDispatch, useSelector } from '@/store/index';
import {
  CreateAuthorizedUser,
  GetPatientAuthorizedUser,
  GetSharingModulesData,
  UpdateSharingModulesData
} from '@/slices/patientprofileslice';
import { useEffect } from 'react';
import { debug } from 'console';
import { format } from 'path';
import { useAriaHiddenFixOnDialog } from '@/hooks/useAriaHiddenFixOnDialog';

function AuthorizedUserHeader() {
  const { CreateAuthorizedUserData, GetSharingModulesDataList } = useSelector(
    (state) => state.patientprofileslice
  );
  const GetSharingModulesList = GetSharingModulesDataList?.result;
  const dispatch = useDispatch();
  const handleSwitchViewClick = () => {};

  const [open, setOpen] = useState(false);
  const [openCDS, setOpenCDS] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const handleClose = () => setOpen(false);
  const handleCloseCDS = () => setOpenCDS(false);
  const [isTouched, setIsTouched] = useState(false); // Tracks whether the user has interacted with the form
  const [loading, setLoading] = useState(false);
  const [snackbarmsg, setsnackbarmsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  //  const [snackbarType, setsnackbarType] = useState('success');
  const [snackbarType, setSnackbarType] = useState<AlertColor>('success');

  const handleSaveCDS = async () => {
    const response = await dispatch(
      UpdateSharingModulesData(togglesJson)
    ).unwrap();

    if (response.result === 'Success') {
      setOpenSnackbar(true);
      setsnackbarmsg('Changes Saved.');
      setSnackbarType('success');
      handleCloseCDS();
    }
  };

  const handleAuthorisedUserSend = async () => {
    try {
      if (validateForm()) {
        return; // Don't proceed if form is invalid
      }
      setLoading(true);
      setIsSending(true); //  Disable the button
      formData.Name = formData.firstName + ' ' + formData.lastName;
      // Dispatch the CreateAuthorizedUser action and wait for it to complete
      const response = await dispatch(CreateAuthorizedUser(formData)).unwrap();
      // Now that the dispatch is complete, check the result of CreateAuthorizedUserData
      // if (response === "success")
      if (response > 0) {
        // Execute your logic when the user is successfully created
        setLoading(false);
        handleClose();
        setOpenSnackbar(true);
        setsnackbarmsg('User created Successfully!');
        setSnackbarType('success');
        await dispatch(
          GetPatientAuthorizedUser(localStorage.getItem('patientID'))
        );
      } else {
        // Handle failure or other cases here
        setLoading(false);
        setIsSending(false);
        // console.error("User creation failed:", response);
        setOpenSnackbar(true);
        setsnackbarmsg('User creation failed');
        setSnackbarType('error');
      }
    } catch (error) {
      // console.error("Error while creating authorized user:", error);
      setLoading(false);
      setIsSending(false);
      // console.error("User creation failed:", response);
      setOpenSnackbar(true);
      setsnackbarmsg('Error while creating authorized user');
      setSnackbarType('error');
    }
  };

  // Email validation regex function
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Validation function for the "Send" button
  const validateForm = () => {
    setIsTouched(true);
    // Return false if any field is empty or email is invalid
    return (
      formData.firstName.trim() === '' ||
      formData.lastName.trim() === '' ||
      formData.EmailAddress.trim() === '' ||
      !isValidEmail(formData.EmailAddress) || // Add email validation check
      formData.Relation.trim() === ''
    );
  };

  useEffect(() => {
    if (localStorage.getItem('patientID') != null) {
      dispatch(GetPatientAuthorizedUser(localStorage.getItem('patientID')));
    }
  }, [dispatch]);

  const handleClickOpenAuthorisedUser = () => {
    setOpen(true);
    setIsTouched(false);
    setIsSending(false); //  Re-enable the button
    // Reset formData to initial state
    setFormData({
      PatientId: localStorage.getItem('patientID'),
      PracticeId: localStorage.getItem('PracticeId'),
      firstName: '',
      lastName: '',
      EmailAddress: '',
      Relation: '',
      Name: ''
    });
  };

  const handleClickOpenControlDataSharing = () => {
    setOpenCDS(true);
    dispatch(GetSharingModulesData(localStorage.getItem('patientID')));
  };

  const [formData, setFormData] = useState({
    PatientId: localStorage.getItem('patientID'),
    PracticeId: localStorage.getItem('PracticeId'),
    firstName: '',
    lastName: '',
    EmailAddress: '',
    Relation: '',
    Name: ''
  });

  // Handle change for each input field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const [toggles, setToggles] = useState({});
  const [togglesJson, setTogglesJson] = useState('');

  useEffect(() => {
    const patientId = localStorage.getItem('patientID');

    const modulesArray = Object.entries(toggles).map(
      ([moduleName, moduleAccess]) => ({
        moduleName,
        moduleAccess
      })
    );

    const newJson = JSON.stringify({
      PatientId: patientId,
      Modules: modulesArray
    });

    setTogglesJson(newJson);
  }, [toggles]); // runs whenever toggles changes

  const handleToggleChange = (item) => {
    const updatedToggles = {
      ...toggles,
      [item.moduleName]: !toggles[item.moduleName]
    };
    setToggles(updatedToggles); // triggers useEffect, which updates togglesJson
  };

  useEffect(() => {
    if (GetSharingModulesList) {
      const initialToggles = {};
      GetSharingModulesList.forEach((item) => {
        initialToggles[item.moduleName] = item.moduleAccess ?? false;
      });
      setToggles(initialToggles);
    }
  }, [GetSharingModulesList]);

  useAriaHiddenFixOnDialog(open);
  useAriaHiddenFixOnDialog(openCDS);

  // Common SX for black border
  const blackBorderSx = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#A0A0A0',
        borderWidth: '1.5px'
      },
      '&:hover fieldset': {
        borderColor: '#A0A0A0'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#A0A0A0'
      },
      '&.Mui-error fieldset': {
        borderColor: '#A0A0A0' // Optional: still black even in error
      }
    },
    '& .MuiInputBase-input::placeholder': {
      color: 'gray'
    },
    '& .MuiInputLabel-root.Mui-error': {
      color: 'gray'
    }
  };

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Typography variant="h3" component="h1" fontWeight="bold">
          {'Authorised User'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {' '}
          {/* This Box will handle the buttons next to each other */}
          {(localStorage.getItem('UserAccessType') == 'Self' ||
            localStorage.getItem('vdtAccess') == 'true') && (
            <Button
              variant={'outlined'}
              sx={{
                textTransform: 'none',
                borderRadius: '5px',
                '&:focus': {
                  outline: '2px solid #1976d2',
                  outlineOffset: '2px'
                },
                '&:focus-visible': {
                  outline: '2px solid #1976d2',
                  outlineOffset: '2px'
                }
              }}
              onClick={handleClickOpenControlDataSharing}
            >
              {'Control Data Sharing'}
            </Button>
          )}
          {(localStorage.getItem('UserAccessType') == 'Self' ||
            localStorage.getItem('vdtAccess') == 'true') && (
            <Button
              variant="contained"
              sx={{
                borderRadius: '5px',
                '&:focus': {
                  outline: '2px solid #1976d2',
                  outlineOffset: '2px'
                },
                '&:focus-visible': {
                  outline: '2px solid #1976d2',
                  outlineOffset: '2px'
                }
              }}
              onClick={handleClickOpenAuthorisedUser}
            >
              Add User
            </Button>
          )}
        </Box>
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderBottom: '1px solid #ddd'
          }}
        >
          <Typography variant="h4" noWrap>
            Add Authorised User
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent className="test">
          <Box sx={{ padding: 2 }}>
            <Grid container spacing={2}>
              {/* First Name and Last Name fields side by side */}
              <Grid item xs={6}>
                <TextField
                  id="firstName"
                  label="Enter First Name"
                  variant="outlined"
                  fullWidth
                  name="firstName"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  error={isTouched && !formData.firstName}
                  helperText={
                    isTouched && !formData.firstName
                      ? 'First Name is required'
                      : ''
                  }
                  FormHelperTextProps={{
                    sx: {
                      fontWeight: 'normal' // Ensures the helper text is not bold
                    }
                  }}
                  sx={{
                    // Remove red outline when there's an error
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-error': {
                        borderColor: 'transparent' // Make the error border transparent
                      }
                    },
                    // Change placeholder color to be normal even when error is present
                    '& .MuiInputBase-input::placeholder': {
                      color: 'gray' // Placeholder color when there is an error
                    },
                    // Optional: Style the label when there is an error
                    '& .MuiInputLabel-root.Mui-error': {
                      color: 'gray' // You can change this to any color you want for the label
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  id="lastName"
                  label="Enter Last Name"
                  variant="outlined"
                  fullWidth
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  error={isTouched && !formData.lastName}
                  helperText={
                    isTouched && !formData.lastName
                      ? 'Last Name is required'
                      : ''
                  }
                  FormHelperTextProps={{
                    sx: {
                      fontWeight: 'normal' // Ensures the helper text is not bold
                    }
                  }}
                  sx={{
                    // Remove red outline when there's an error
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-error': {
                        borderColor: 'transparent' // Make the error border transparent
                      }
                    },
                    // Change placeholder color to be normal even when error is present
                    '& .MuiInputBase-input::placeholder': {
                      color: 'gray' // Placeholder color when there is an error
                    },
                    // Optional: Style the label when there is an error
                    '& .MuiInputLabel-root.Mui-error': {
                      color: 'gray' // You can change this to any color you want for the label
                    }
                  }}
                />
              </Grid>

              {/* Email Address field */}
              <Grid item xs={6}>
                <TextField
                  id="emailAddress"
                  label="Enter Email Address"
                  variant="outlined"
                  fullWidth
                  name="EmailAddress"
                  autoComplete="email"
                  value={formData.EmailAddress}
                  onChange={handleChange}
                  required
                  type="email"
                  error={
                    isTouched &&
                    (!formData.EmailAddress ||
                      !isValidEmail(formData.EmailAddress))
                  }
                  helperText={
                    isTouched && !formData.EmailAddress
                      ? 'Email Address is required'
                      : isTouched && !isValidEmail(formData.EmailAddress)
                      ? 'Invalid email address'
                      : ''
                  }
                  FormHelperTextProps={{
                    sx: {
                      fontWeight: 'normal' // Ensures the helper text is not bold
                    }
                  }}
                  sx={{
                    // Remove red outline when there's an error
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-error': {
                        borderColor: 'transparent' // Make the error border transparent
                      }
                    },
                    // Change placeholder color to be normal even when error is present
                    '& .MuiInputBase-input::placeholder': {
                      color: 'gray' // Placeholder color when there is an error
                    },
                    // Optional: Style the label when there is an error
                    '& .MuiInputLabel-root.Mui-error': {
                      color: 'gray' // You can change this to any color you want for the label
                    }
                  }}
                  // sx={blackBorderSx}
                />
              </Grid>

              {/* Relationship Dropdown */}
              <Grid item xs={6}>
                <FormControl
                  fullWidth
                  required
                  error={isTouched && !formData.Relation}
                >
                  <InputLabel
                    id="relationship-label"
                    sx={{
                      color: 'gray',
                      '&.Mui-focused': { color: 'gray' },
                      '&.Mui-error': { color: 'gray' },
                      '& .MuiInputLabel-asterisk': { color: 'gray' },
                      '&.Mui-error .MuiInputLabel-asterisk': { color: 'red' }
                    }}
                  >
                    Select Relationship
                  </InputLabel>
                  <Select
                    id="relation"
                    labelId="relationship-label"
                    label="Relationship"
                    name="Relation"
                    value={formData.Relation}
                    onChange={handleChange}
                  >
                    <MenuItem value="Family">Family</MenuItem>
                    <MenuItem value="Mother">Mother</MenuItem>
                    <MenuItem value="Father">Father</MenuItem>
                    <MenuItem value="Brother">Brother</MenuItem>
                    <MenuItem value="Sister">Sister</MenuItem>
                    <MenuItem value="Spouse">Spouse</MenuItem>
                    <MenuItem value="Guardian">Guardian</MenuItem>
                    <MenuItem value="Grandparent">Grandparent</MenuItem>
                    <MenuItem value="Care Giver">Care Giver</MenuItem>
                    <MenuItem value="Foster Child">Foster Child</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>

                  {/* Use FormHelperText for consistent behavior */}
                  {isTouched && !formData.Relation && (
                    <FormHelperText sx={{ fontWeight: 'normal' }}>
                      Relationship is required
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderTop: '1px solid #ddd',
            gap: 2
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{ borderRadius: '5px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAuthorisedUserSend}
            sx={{ borderRadius: '5px' }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Send'
            )}
          </Button>
        </Box>
      </Dialog>

      <Dialog open={openCDS} onClose={handleCloseCDS} fullWidth maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderBottom: '1px solid #ddd'
          }}
        >
          <Typography variant="h4" noWrap>
            Control Data Sharing
          </Typography>
          <IconButton onClick={handleCloseCDS}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* DialogContent */}
        <DialogContent>
          {/* Info Card */}
          <Card
            sx={{
              backgroundColor: 'rgba(96, 148, 185, 0.16)',
              mb: 2,
              borderRadius: 2
            }}
          >
            <CardContent sx={{ padding: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                Toggle settings to request a restriction on specific health
                data, for treatment, payment, or health care operations.
              </Typography>
            </CardContent>
          </Card>

          {/* Scrollable Table with Sticky Header */}
          <TableContainer sx={{ maxHeight: '300px', overflowY: 'auto' }}>
            <Table
              stickyHeader
              sx={{ borderCollapse: 'separate', borderSpacing: '0 5px' }}
            >
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: 'black',
                      backgroundColor: '#f5f5f5',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      width: '75%'
                    }}
                  >
                    Information
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: 'black',
                      backgroundColor: '#f5f5f5',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      width: '25%'
                    }}
                  >
                    Access Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {GetSharingModulesList?.map((item, index) => (
                  <TableRow
                    key={index}
                    sx={{ borderBottom: '1px solid #e0e0e0' }}
                  >
                    <TableCell>{item.moduleName}</TableCell>
                    <TableCell>
                      <Switch
                        id={`switchControl-${index}`} // Unique ID for the switch
                        checked={toggles[item.moduleName] ?? false}
                        onChange={() => handleToggleChange(item)}
                        color="primary"
                        inputProps={{
                          'aria-label': 'Enable/Disable Control Sharing'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderTop: '1px solid #ddd',
            gap: 2
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseCDS}
            sx={{ borderRadius: '5px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCDS}
            sx={{ borderRadius: '5px' }}
          >
            Save
          </Button>
        </Box>
      </Dialog>

      {/* Snackbar for Success Message of Create User */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarType}
          variant="filled"
        >
          {snackbarmsg}
        </Alert>
      </Snackbar>
    </>
  );
}

export default AuthorizedUserHeader;
