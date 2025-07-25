'use client';
import { Box, Typography, Button, keyframes } from '@mui/material';
import { ConsentForm } from '@/types/ConsentForm';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import { useRef, useState, useEffect } from 'react';
import SignatureDialog from './SignatureDialog';
import { saveConsentForm } from '@/slices/patientprofileslice';
import { useSelector, useDispatch } from '@/store/index';
import { Snackbar, Alert } from '@mui/material';

interface Props {
  form: (ConsentForm & { Signature?: string }) | null;
  onFormSigned: (formId: string, Signature: string) => void;
  pendingForms: (ConsentForm & { Signature?: string })[];
  onSelectForm: (form: ConsentForm & { Signature?: string }) => void;
}

const bounce = keyframes`
  0%   { transform: scale(1); opacity: 0.8; }
  50%  { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const ConsentFormViewer = ({ form, onFormSigned, pendingForms, onSelectForm }: Props) => {
  const dispatch = useDispatch();
  const contentRef = useRef<HTMLDivElement>(null);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [renderedContent, setRenderedContent] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [showAllSignedMessage, setShowAllSignedMessage] = useState(false);
  const prevPendingCount = useRef<number>(0);

  useEffect(() => {
    if (form) {
      const updatedContent = form.Content.replace(
        '{{patient_signature}}',
        form.Signature
          ? `<img src="${form.Signature}" alt="Patient Signature" style="max-width: 100%; height: auto; margin-top: 20px;" />`
          : '<div style="margin-top: 20px; height: 100px; border: 1px dashed #aaa; text-align: center; line-height: 100px;">Patient Signature</div>'
      );
      setRenderedContent(updatedContent);
    }
  }, [form]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    if (countdown === 1 && Array.isArray(pendingForms) && form?.FormID) {
      const currentIndex = pendingForms.findIndex(f => f.FormID === form.FormID);

      if (currentIndex !== -1 && currentIndex + 1 < pendingForms.length) {
        onSelectForm(pendingForms[currentIndex + 1]);
      }
    }

    return () => clearTimeout(timer);
  }, [countdown, pendingForms, form]);


useEffect(() => {
  const currentPendingCount = pendingForms.filter(f => f.Status === 'Pending').length;
  const allSigned = currentPendingCount === 0 && prevPendingCount.current > 0;

  if (allSigned) {
    setShowAllSignedMessage(true);

    const timer = setTimeout(() => {
      setShowAllSignedMessage(false);
    }, 3000);

    return () => clearTimeout(timer);
  }

  // Update previous count at the end of the effect
  prevPendingCount.current = currentPendingCount;
}, [pendingForms]);

  const handlePrint = () => {
    if (typeof window === 'undefined') return;

    const contentHTML = `
      <h1 style="margin-bottom: 20px; font-size: 20px; text-align: center;">${form?.Title}</h1>
      ${renderedContent}
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${form?.Title}</title>
          <style>
            @media print {
              @page { margin: 0; }
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; color: #000; }
            }
          </style>
        </head>
        <body>${contentHTML}</body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPDF = async () => {
    if (typeof window === 'undefined' || !contentRef.current || !form) return;

    const html2pdf = (await import('html2pdf.js')).default;
    const opt = {
      margin: 0.5,
      filename: `${form.Title.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(contentRef.current).save();
  };

  const handleOpenSignature = () => setSignatureOpen(true);
  const handleCloseSignature = () => setSignatureOpen(false);

  const handleSaveSignature = async (Signature: string) => {
    if (!form) return;

    const updatedForm: ConsentForm = {
      PatientID: localStorage.getItem('patientID'),
      ...form,
      Signature,
      Status: 'Signed',
      SignedDate: new Date().toISOString(),
    };

    try {
      const response = await dispatch(saveConsentForm(updatedForm));

      //  Forcefully check for result === 'success'
      if (response.payload.result === 'success') {
        setSnackbarMessage('Signing Complete!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        onFormSigned(form.FormID, Signature);
        setCountdown(5);
      }
      else {
        debugger;
        console.log(response);
        setSnackbarMessage(response.payload.result);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error saving form:', error);
      setSnackbarMessage('Something went wrong while saving.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }

    setSignatureOpen(false);
  };




  if (!form) {
    return (
      <Box height="100%" display="flex" alignItems="center" justifyContent="center" color="text.secondary">
        <Typography variant="body1">Please select a form to view.</Typography>
      </Box>
    );
  }


  if (!form) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
        }}
      >
        <Typography variant="body1">Please select a form to view.</Typography>
      </Box>
    );
  }


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid #ddd',
          bgcolor: 'background.paper',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 2,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {form.Title}
        </Typography>
        <Box>
          {form.Status === 'Signed' && (
            <Button onClick={handleDownloadPDF} size="small" startIcon={<DownloadIcon />} sx={{ mr: 1 }}>
              Download PDF
            </Button>
          )}
          <Button onClick={handlePrint} size="small" startIcon={<PrintIcon />}>
            Print
          </Button>
        </Box>
      </Box>

      <Box
        ref={contentRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 3,
          py: 2,
          background: 'linear-gradient(to right, #fefefe, #f5f7fa)', // Soft gradient background
          borderRadius: 2,
          position: 'relative',
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: renderedContent }} />

        {
          countdown !== null && countdown > 0 &&
          pendingForms.some(f => f.Status === 'Pending') && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'white',
                opacity: '0.9',
                color: '#1976d2',
                p: 4,
                borderRadius: 3,
                boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                textAlign: 'center',
                zIndex: 1000,
                minWidth: 300,
              }}
            >
              <Typography variant="body1" fontWeight={500}>
                Loading the next consent form in
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  mt: 1,
                  animation: `${bounce} 1s ease-in-out infinite`,
                }}
              >
                {countdown}
              </Typography>
            </Box>
          )
        }
      </Box>


      {
  showAllSignedMessage && (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'white',
        opacity: '0.95',
        color: 'green',
        p: 4,
        borderRadius: 3,
        boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center',
        zIndex: 1000,
        minWidth: 300,
        transition: 'opacity 0.5s ease-in-out',
      }}
    >
      <Typography variant="h6" fontWeight={600}>
        🎉 You have completed all pending consent forms!
      </Typography>
    </Box>
  )
}




      {/* Footer */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid #ddd',
          bgcolor: 'background.paper',
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          textAlign: 'right',
        }}
      >
        {form.Status === 'Pending' && (
          <Button
            variant="contained"
            color="primary"
            sx={{ borderRadius: '5px' }}
            onClick={handleOpenSignature}
          >
            Sign
          </Button>
        )}
      </Box>


      <SignatureDialog open={signatureOpen} onClose={handleCloseSignature} onSave={handleSaveSignature} />


      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default ConsentFormViewer;


