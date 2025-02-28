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
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useDispatch,useSelector } from '@/store/index';
import { InsertActivityLog, ShareDocument,} from '@/slices/patientprofileslice';

function EncounterDetailsReport() {

 const {EncounterId,ShareDocumentData} = useSelector((state) => state.patientprofileslice);
 const dispatch = useDispatch();
 const [open, setOpen] = useState(false);
 const [email, setEmail] = useState('andrew_doe@email.com');
 const [message, setMessage] = useState('');
 const [openSnackbar, setOpenSnackbar] = useState(false);
 const [isTouched, setIsTouched] = useState(false);  // Track if user has clicked Send

    //Save ActivityLog Obj 
  const Logobj = {
    PatientId: localStorage.getItem('patientID'),
    ActivityTypeId: '3'
  };
  const Emailobj ={
    PatientEmail : localStorage.getItem('patientEmail'),
    EncounterId : EncounterId
  }
  
  const handleClickOpen = () =>{ 
    setOpen(true);
    setMessage('');
    setIsTouched(false);
  }
  const handleClose = () => setOpen(false);
  const handleSendEmail  = () => {
    setIsTouched(true);
    if (message.trim() === '') {
      return; // Don't proceed if the message is empty
    }
    dispatch(ShareDocument(Emailobj));
   if(ShareDocumentData==true){
    handleClose();
    setOpenSnackbar(true);
    const LogEmailobj = {
      PatientId: localStorage.getItem('patientID'),
      ActivityTypeId: '4'
    };
    dispatch(InsertActivityLog(LogEmailobj));
   
  }
  }
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
          height: 'calc(80vh - 100px)',
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
            sx={{ borderRadius: '5px' }}
            onClick={handleClickOpen}
          >
            Email
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            sx={{ borderRadius: '5px' }}
            onClick={() => handleDownload()}
          >
            Download (Human Readable Format)
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="primary"
            sx={{ borderRadius: '5px' }}
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

            <TextField
              fullWidth
              label="Email Address"
              value={Emailobj.PatientEmail}
              onChange={(e) => setEmail(e.target.value)}
              margin="dense"
              variant="outlined"
              disabled
              
            />
             <TextField
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
        />

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