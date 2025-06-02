import React, { useState } from 'react';
import {
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
  FormControlLabel,
  Checkbox
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useDispatch, useSelector } from '@/store/index';
import { InsertActivityLog, ShareDocument, } from '@/slices/patientprofileslice';
import { useEffect } from 'react';
import { useAriaHiddenFixOnDialog } from '@/hooks/useAriaHiddenFixOnDialog';

function EncounterDetailsReport() {

  const { EncounterId, ShareDocumentData } = useSelector((state) => state.patientprofileslice);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isTouched, setIsTouched] = useState(false);  // Track if user has clicked Send
  const [emailError, setEmailError] = useState(false);
  const [includeCCD, setIncludeCCD] = useState(true);

  //Save ActivityLog Obj 
  const Logobj = {
    PatientId: localStorage.getItem('patientID'),
     Email: localStorage.getItem('Email'), //email
    ActivityTypeId: '3'  
  };
  const Emailobj = {
    PatientEmail: email,// localStorage.getItem('patientEmail'),
    EncounterId: EncounterId
  }

  const handleClickOpen = () => {
    setOpen(true);
    setMessage('');
    setIsTouched(false);
    setEmail('');
  }
  const handleClose = () => setOpen(false);
  // const handleSendEmail  = () => {

  //   setIsTouched(true);
  //   if (message.trim() === '') {
  //     return; // Don't proceed if the message is empty
  //   }
  //   dispatch(ShareDocument(Emailobj));
  //  if(ShareDocumentData==true){
  //   handleClose();
  //   setOpenSnackbar(true);
  //   const LogEmailobj = {
  //     PatientId: localStorage.getItem('patientID'),
  //     Email : localStorage.getItem('Email'), 
  //     ActivityTypeId: '4'
  //   };
  //   dispatch(InsertActivityLog(LogEmailobj));

  // }

  // }



  const handleSendEmail = () => {
    setIsTouched(true);

    const isEmailValid = email.trim() !== '' && /\S+@\S+\.\S+/.test(email);
    const isMessageValid = message.trim() !== '';

    setEmailError(!isEmailValid);

    if (!isEmailValid || !isMessageValid) {
      return; // stop here if any field is invalid
    }

    dispatch(ShareDocument(Emailobj));

    if (ShareDocumentData === true) {
      handleClose();
      setOpenSnackbar(true);
      const LogEmailobj = {
        PatientId: localStorage.getItem('patientID'),
        Email: localStorage.getItem('Email'),
        ActivityTypeId: '4'
      };
      dispatch(InsertActivityLog(LogEmailobj));
    }
  };


  useEffect(() => {
    // Check if ShareDocumentData is true
    if (ShareDocumentData === true) {
      // Execute your logic when ShareDocumentData is updated
      handleClose();
      // setOpenSnackbar(true);

      const LogEmailobj = {
        PatientId: localStorage.getItem('patientID'),
        Email: email, // localStorage.getItem('Email'),
        ActivityTypeId: '4',
      };
      dispatch(InsertActivityLog(LogEmailobj));
    }
  }, [ShareDocumentData, dispatch]); // Dependency on ShareDocumentData so the effect runs when it changes


  const { PatientCCDADetail } = useSelector(
    (state) => state.patientprofileslice
  );
  const { PatientCCDADetailXMLF } = useSelector(
    (state) => state.patientprofileslice
  );

  const handleDownload = () => {
    const blob = new Blob([PatientCCDADetail], {
      type: 'text/html'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `patient_data.${'html'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    dispatch(InsertActivityLog(Logobj));
  };

  const handleDownloadxml = () => {
    const blob = new Blob([PatientCCDADetailXMLF], {
      type: 'application/xml'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `patient_data.${'xml'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    dispatch(InsertActivityLog(Logobj));
  };

  useAriaHiddenFixOnDialog(open);

  return (
    <Box
      sx={{
        padding: 1,
        flexGrow: 1
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: 'calc(64vh - 100px)',
          backgroundColor: '#fff'
        }}
      >
        <iframe
          title="Patient Report"
          srcDoc={PatientCCDADetail}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </Box>

      <Grid container spacing={2} justifyContent="right" sx={{ marginTop: 2 }}>
        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: '5px', '&:focus': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              },
              '&:focus-visible': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              }
            }}
            onClick={handleClickOpen}
          >
            Email
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: '5px', '&:focus': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              },
              '&:focus-visible': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              }
            }}
            onClick={() => handleDownload()}
          >
            Download (Human Readable Format)
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: '5px', '&:focus': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              },
              '&:focus-visible': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              }
            }}
            onClick={() => handleDownloadxml()}
          >
            Download (CCD Format)
          </Button>
        </Grid>
      </Grid>

      {/* Dialog box for Email Pop-up */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Send Health Data
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
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center">
              <AttachFileIcon color="action" />
              <Typography variant="body2" fontWeight="bold">
                CCD document will be automatically attached to this message
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <TextField
                id="emailAddress"
                fullWidth
                label="Email Address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isTouched) {
                    const isValid = /\S+@\S+\.\S+/.test(e.target.value);
                    setEmailError(!isValid);
                  }
                }}
                margin="dense"
                variant="outlined"
                required
                error={isTouched && emailError}
                helperText={
                  isTouched && emailError ? 'Enter a valid email address' : ''
                }
                FormHelperTextProps={{
                  sx: {
                    fontWeight: 'normal'
                  }
                }}
                sx={{
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-error': {
                      borderColor: 'transparent'
                    }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'gray'
                  },
                  '& .MuiInputLabel-root.Mui-error': {
                    color: 'gray'
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeCCD}
                    onChange={(e) => setIncludeCCD(e.target.checked)}
                    color="primary"
                  />
                }
                label="Secure"
                sx={{ whiteSpace: 'nowrap' }}
              />
            </Box>

            <TextField
             id="MessageId"
              fullWidth
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              margin="dense"
              variant="outlined"
              multiline
              rows={3}
              required
              error={isTouched && !message} // Show error if message is empty and Send button is clicked
              helperText={isTouched && !message ? 'Message cannot be empty' : ''} // Custom helper text when Send is clicked
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

          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end", paddingRight: "22px", marginBottom: "10px" }}>
          <Button
            variant="outlined"
            color="primary"
            sx={{
              borderRadius: '5px', '&:focus': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              },
              '&:focus-visible': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              }
            }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: '5px', '&:focus': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              },
              '&:focus-visible': {
                outline: '2px solid #1976d2',
                outlineOffset: '2px'
              }
            }}
            onClick={handleSendEmail}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Success Message of Sent Email */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" variant="filled">
          Email Sent Successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EncounterDetailsReport;