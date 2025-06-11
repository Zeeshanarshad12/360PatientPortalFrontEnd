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
  Checkbox,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useDispatch, useSelector } from '@/store/index';
import { InsertActivityLog, ShareDocument, } from '@/slices/patientprofileslice';
import { useEffect } from 'react';
import { useAriaHiddenFixOnDialog } from '@/hooks/useAriaHiddenFixOnDialog';
import { parseString } from 'xml2js';
import MapXMLDirectly from './MapXMLDirectly';
import { isNull } from '@/utils/functions';

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
  const [parseJson, setParsedJson] = useState(null);
  const [jsonError, setJsonError] = useState(null);

  //Save ActivityLog Obj 
  const Logobj = {
    PatientId: localStorage.getItem('patientID'),
     Email: localStorage.getItem('Email'),
    ActivityTypeId: '3'  
  };

  const Emailobj = {
    PatientEmail: email,
    EncounterId: EncounterId,
    message :  message,
    includeCCD : includeCCD
  }

  const handleClickOpen = () => {
    setOpen(true);
    setMessage('');
    setIsTouched(false);
    setEmail('');
  }
  const handleClose = () => setOpen(false);

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
        Email: (email+'|'+localStorage.getItem('Email')), // localStorage.getItem('Email'),
        ActivityTypeId: '4'
      };
      dispatch(InsertActivityLog(LogEmailobj));
    }
  };

  const { PatientCCDADetail } = useSelector(
    (state) => state.patientprofileslice
  );
  const { PatientCCDADetailXMLF } = useSelector(
    (state) => state.patientprofileslice
  );

const handleDownload = () => {
  // Extract and format section titles from the PatientCCDADetail
  const extractAndFormatSections = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const sections = doc.querySelectorAll('component > section');

    let formatted = '';

    sections.forEach((section, index) => {
      const title = section.querySelector('title')?.textContent?.trim() || `Section ${index + 1}`;
      const content = section.querySelector('text')?.innerHTML?.trim() || 'No information available';

      formatted += `
        <div class="section">
          <h3 class="section-title">${title}</h3>
          <div>${content}</div>
        </div>
      `;
    });

    return formatted || htmlString; // fallback to raw HTML if no match
  };

  const formattedSections = extractAndFormatSections(PatientCCDADetail);

  const styledHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Patient Clinical Document</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
    padding: 20px;
    font-size: 14px;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    text-align: center;
  }
  .header h1 {
    font-size: 18px;
    margin-bottom: 10px;
    font-weight: 500;
  }
  .header p {
    font-size: 14px;
    opacity: 0.9;
  }
  .content {
    padding: 30px;
  }
  .section {
    margin-bottom: 30px;
    border-left: 4px solid #667eea;
    padding-left: 20px;
  }
  .section-title {
    color: #667eea;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 14px;
  }
  th, td {
    padding: 10px;
    border: 1px solid #dee2e6;
    text-align: left;
  }
  th {
    background-color: #f1f3f5;
    color: #495057;
    font-size: 14px;
  }
  .timestamp {
    color: #6c757d;
    font-size: 14px;
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
  }
  @media print {
    body { background: white; padding: 0; }
    .container { box-shadow: none; max-width: none; }
    .header { background: #667eea !important; -webkit-print-color-adjust: exact; }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Clinical Document</h1>
      <h1>Continuity of Care Document (CCD)</h1>
    </div>
    <div class="content">
      ${formattedSections}
    </div>
    <div class="timestamp">
      Generated on: ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([styledHtml], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `patient_clinical_document_${new Date().toISOString().split('T')[0]}.html`;
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



  useEffect(() => {
     if (PatientCCDADetail) {

      parseString(
        PatientCCDADetail,
        { explicitArray: false, mergeAttrs: true },
        (err, result) => {

          if (err) {
            console.error('Failed to parse XML:', err);
            setParsedJson(null);
            setJsonError('Failed to parse XML content.');
          } else {
            setParsedJson(result);
            setJsonError(null);
          }
        }
      );
    }
  }, [PatientCCDADetail])
  

  return (
    <Box
      sx={{
        padding: 1,
        flexGrow: 1
      }}
    >
      {
        isNull(parseJson) ? (
          <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress size={30} color="primary" />
        </Box>
        ):(
             <Box
        sx={{
          width: '100%',
          height: 'calc(64vh - 100px)',
          backgroundColor: '#fff',
          overflowY:'auto'
        }}
      >
        < MapXMLDirectly XmlToJson={parseJson}/>
        {/* <iframe
          title="Patient Report"
          srcDoc={PatientCCDADetail}
          style={{ width: '100%', height: '100%', border: 'none' }}
        /> */}
      </Box>
        )
      }
   

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