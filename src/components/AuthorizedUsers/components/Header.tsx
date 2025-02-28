import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Card,
  CardContent,
  Box,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  TextField,
  Divider,
  Snackbar,
  Alert,
  Switch,FormControl,Select,MenuItem,InputLabel} from '@mui/material';
  import { useDispatch, useSelector } from '@/store/index';
  import {CreateAuthorizedUser } from '@/slices/patientprofileslice';
function AuthorizedUserHeader()  {
const {CreateAuthorizedUserData} = useSelector((state) => state.patientprofileslice);
    const dispatch = useDispatch();
    const handleSwitchViewClick = () => {

    };
    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);
    const handleAuthorisedUserSend  = () => {
      dispatch(CreateAuthorizedUser(formData));
      console.log(CreateAuthorizedUserData)
    }
    const handleClickOpenAuthorisedUser = () =>{ 
      setOpen(true);
    }
    const [formData, setFormData] = useState({
      PatientId: localStorage.getItem('patientID'),
      firstName: '',
      lastName: '',
      emailAddress: '',
      relationship: '',
    });

    // Handle change for each input field
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });

      console.log(formData);
    };


    return (
      <>
      <Grid container justifyContent="space-between" alignItems="center">
       <Typography variant="h4" fontWeight="bold">
         {'Authorised User'}
       </Typography>
       <Box sx={{ display: 'flex', gap: 1 }}>  {/* This Box will handle the buttons next to each other */}
         <Button
           variant={'outlined'}
           sx={{ textTransform: 'none', borderRadius: '5px' }}
           onClick={handleSwitchViewClick}
         >
           {'Control Data Sharing'}
         </Button>
         <Button
           variant="contained"
           sx={{ borderRadius: '5px' }}
           onClick={handleClickOpenAuthorisedUser}
         >
           Add User
         </Button>
       </Box>
     </Grid>

   

 {/* Dialog box for Add Authorised User Pop-up */}
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
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Enter  Name"
            variant="outlined"
            fullWidth
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
        </Grid>

        {/* Email Address field */}
        <Grid item xs={6}>
          <TextField
            label="Enter Email Address"
            variant="outlined"
            fullWidth
            name="emailAddress"
            value={formData.emailAddress}
            onChange={handleChange}
            type="email"
          />
        </Grid>

        {/* Relationship Dropdown */}
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="relationship-label">Relationship</InputLabel>
            <Select
              labelId="relationship-label"
              label="Relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
            >
              <MenuItem value="Family">Family</MenuItem>
              <MenuItem value="Caregiver">Caregiver</MenuItem>
              <MenuItem value="Friend">Friend</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>

      </Grid>
    </Box>
 </DialogContent>

 <DialogActions sx={{ justifyContent: "flex-end", paddingRight: "22px", marginBottom: "10px" }}>
   <Button
     variant="outlined"
     color="primary"
     sx={{ borderRadius: '5px' }}
     onClick={handleClose}
   >
     Cancel
   </Button>
   <Button
     variant="contained"
     color="primary"
     sx={{ borderRadius: '5px' }}
     onClick={handleAuthorisedUserSend}
   >
     Send
   </Button>
 </DialogActions>
</Dialog>

      </>
    );
  };
  
  export default AuthorizedUserHeader;