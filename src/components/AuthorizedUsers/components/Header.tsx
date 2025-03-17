import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { CircularProgress,Card, CardContent, Box, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, TextField, Divider, Snackbar, Alert, Switch, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { useDispatch, useSelector } from '@/store/index';
import { CreateAuthorizedUser, GetPatientAuthorizedUser } from '@/slices/patientprofileslice';
import { useEffect } from 'react';
import { debug } from 'console';
import { format } from 'path';

function AuthorizedUserHeader() {
  const { CreateAuthorizedUserData } = useSelector((state) => state.patientprofileslice);
  const dispatch = useDispatch();
  const handleSwitchViewClick = () => {};

  const [open, setOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const handleClose = () => setOpen(false);
  const [isTouched, setIsTouched] = useState(false); // Tracks whether the user has interacted with the form
  const [loading, setLoading] = useState(false);

  const handleAuthorisedUserSend = async () => {
    try {
      if (validateForm()) {
        return; // Don't proceed if form is invalid
      }
      setLoading(true);
      formData.Name = formData.firstName+' '+formData.lastName;
      // Dispatch the CreateAuthorizedUser action and wait for it to complete
      const response = await dispatch(CreateAuthorizedUser(formData)).unwrap();
      // Now that the dispatch is complete, check the result of CreateAuthorizedUserData
      if (response === "success") {
        // Execute your logic when the user is successfully created
        setLoading(false);
        handleClose();
        setOpenSnackbar(true);
        await dispatch(GetPatientAuthorizedUser(localStorage.getItem('patientID')));
      } else {
        // Handle failure or other cases here
        console.error("User creation failed:", response);
      }
    } catch (error) {
      console.error("Error while creating authorized user:", error);
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
    // Reset formData to initial state
    setFormData({
      PatientId: localStorage.getItem('patientID'),
      PracticeId:localStorage.getItem('PracticeId'),
      firstName: '',
      lastName: '',
      EmailAddress: '',
      Relation: '',
      Name : ''
    });
  };

  const [formData, setFormData] = useState({
    PatientId: localStorage.getItem('patientID'),
    PracticeId:localStorage.getItem('PracticeId'),
    firstName: '',
    lastName: '',
    EmailAddress: '',
    Relation: '',
    Name : ''
  });

  // Handle change for each input field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold">
          {'Authorised User'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>  {/* This Box will handle the buttons next to each other */}
        {localStorage.getItem("UserAccessType")  === "Self" && (
          <Button
            variant={'outlined'}
            sx={{ textTransform: 'none', borderRadius: '5px' }}
            onClick={handleSwitchViewClick}
          >
            {'Control Data Sharing'}
          </Button>
          )}
      {localStorage.getItem("UserAccessType")  === "Self" && (
      <Button
        variant="contained"
        sx={{ borderRadius: '5px' }}
        onClick={handleClickOpenAuthorisedUser}
      >
        Add User
      </Button>
    )}
        </Box>
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Add Authorised User
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          <Divider sx={{ marginY: 1 }} />
        </DialogTitle>

        <DialogContent>
          <Box sx={{ padding: 2 }}>
            <Grid container spacing={2}>
              {/* First Name and Last Name fields side by side */}
              <Grid item xs={6}>
                <TextField
                  label="Enter First Name"
                  variant="outlined"
                  fullWidth
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  error={isTouched && !formData.firstName}
                  helperText={isTouched && !formData.firstName ? 'First Name is required' : ''}
                  FormHelperTextProps={{
                    sx: {
                      fontWeight: 'normal', // Ensures the helper text is not bold
                    },
                  }}
                  sx={{
                    // Remove red outline when there's an error
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-error': {
                        borderColor: 'transparent', // Make the error border transparent
                      },
                    },
                    // Change placeholder color to be normal even when error is present
                    '& .MuiInputBase-input::placeholder': {
                      color: 'gray', // Placeholder color when there is an error
                    },
                    // Optional: Style the label when there is an error
                    '& .MuiInputLabel-root.Mui-error': {
                      color: 'gray', // You can change this to any color you want for the label
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Enter Last Name"
                  variant="outlined"
                  fullWidth
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  error={isTouched && !formData.lastName}
                  helperText={isTouched && !formData.lastName ? 'Last Name is required' : ''}
                  FormHelperTextProps={{
                    sx: {
                      fontWeight: 'normal', // Ensures the helper text is not bold
                    },
                  }}
                  sx={{
                    // Remove red outline when there's an error
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-error': {
                        borderColor: 'transparent', // Make the error border transparent
                      },
                    },
                    // Change placeholder color to be normal even when error is present
                    '& .MuiInputBase-input::placeholder': {
                      color: 'gray', // Placeholder color when there is an error
                    },
                    // Optional: Style the label when there is an error
                    '& .MuiInputLabel-root.Mui-error': {
                      color: 'gray', // You can change this to any color you want for the label
                    },
                  }}
                  />
              </Grid>

              {/* Email Address field */}
              <Grid item xs={6}>
                <TextField
                  label="Enter Email Address"
                  variant="outlined"
                  fullWidth
                  name="EmailAddress"
                  value={formData.EmailAddress}
                  onChange={handleChange}
                  required
                  type="email"
                  error={isTouched && (!formData.EmailAddress || !isValidEmail(formData.EmailAddress))}
                  helperText={
                    isTouched && !formData.EmailAddress
                      ? 'Email Address is required'
                      : isTouched && !isValidEmail(formData.EmailAddress)
                      ? 'Invalid email address'
                      : ''
                  }
                  FormHelperTextProps={{
                    sx: {
                      fontWeight: 'normal', // Ensures the helper text is not bold
                    },
                  }}
                  sx={{
                    // Remove red outline when there's an error
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-error': {
                        borderColor: 'transparent', // Make the error border transparent
                      },
                    },
                    // Change placeholder color to be normal even when error is present
                    '& .MuiInputBase-input::placeholder': {
                      color: 'gray', // Placeholder color when there is an error
                    },
                    // Optional: Style the label when there is an error
                    '& .MuiInputLabel-root.Mui-error': {
                      color: 'gray', // You can change this to any color you want for the label
                    },
                  }}
                />
              </Grid>

              {/* Relationship Dropdown */}
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel id="relationship-label">Relationship</InputLabel>
                  <Select
                    labelId="relationship-label"
                    label="Relationship"
                    name="Relation"
                    value={formData.Relation}
                    onChange={handleChange}
                    error={isTouched && !formData.Relation}
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
                  {isTouched && !formData.Relation && (
                    <span style={{ color: 'red', fontSize: '12px' }}>Relationship is required</span>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'flex-end', paddingRight: '22px', marginBottom: '10px' }}>
          <Button variant="outlined" color="primary" sx={{ borderRadius: '5px' }} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ borderRadius: '5px' }}
            onClick={handleAuthorisedUserSend}
          >
           {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Send'
              )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Success Message of Create User */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" variant="filled">
          User created Successfully!
        </Alert>
      </Snackbar>
    </>
  );
}

export default AuthorizedUserHeader;
