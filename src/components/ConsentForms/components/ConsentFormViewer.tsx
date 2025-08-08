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
import { useConsentFormContext } from '@/contexts/ConsentFormContext';

interface Props {
  form: (ConsentForm & { Signature?: string }) | null;
  onFormSigned: (formId: string, Signature: string) => void;
  pendingForms: (ConsentForm & { Signature?: string })[];
  onSelectForm: (form: ConsentForm & { Signature?: string }) => void;
  triggerRefresh: () => void;
}

const bounce = keyframes`
  0%   { transform: scale(1); opacity: 0.8; }
  50%  { transform: scale(1.4); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const ConsentFormViewer = ({ form, onFormSigned, pendingForms, onSelectForm, triggerRefresh }: Props) => {
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
const hasShownCompletionMessage = useRef<boolean>(false);

  const { decrementPendingCount } = useConsentFormContext();

  useEffect(() => {
  if (form) {
    let updatedContent = form.Content;

    // Replace ______________________ with signature if exists
    updatedContent = updatedContent.replace(
      /_{10,}/g, // match a long underscore line
      form.Signature
        ? `<img src="${form.Signature}" alt="Patient Signature" style="max-width: 250px; height: auto;" />`
        : '___________________________' 
    );

    setRenderedContent(updatedContent);
  }
}, [form]);


  const [hasMovedToNext, setHasMovedToNext] = useState(false);
  useEffect(() => {
    if (countdown === null || countdown <= 0 || !form?.FormID) return;

    const timer = setTimeout(() => {
      setCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    if (countdown === 1) {
      setTimeout(() => {
        const remainingPending = pendingForms.filter(f => f.Status === 'Pending');
        const currentFormID = form.FormID;

        if (remainingPending.length === 0) return;

        const currentIndex = remainingPending.findIndex(f => f.FormID === currentFormID);

        let nextForm: ConsentForm | undefined;

        if (currentIndex !== -1 && currentIndex + 1 < remainingPending.length) {
          nextForm = remainingPending[currentIndex + 1]; 
        } else {
          nextForm = remainingPending[0];
        }

        setCountdown(null);

        if (nextForm) {
          onSelectForm(nextForm);
        }
      }, 300); 
    }

    return () => clearTimeout(timer);
  }, [countdown, pendingForms, form?.FormID]);


  // Reset flag when new countdown starts
  useEffect(() => {
    if (countdown === 5) {
      setHasMovedToNext(false);
    }
  }, [countdown]);


useEffect(() => {
  const currentPendingCount = pendingForms.filter(f => f.Status === 'Pending').length;
  const allSigned = currentPendingCount === 0 && prevPendingCount.current > 0;

  let timer: NodeJS.Timeout | null = null;

  if (allSigned && !hasShownCompletionMessage.current) {
    setShowAllSignedMessage(true);
    hasShownCompletionMessage.current = true;
 localStorage.setItem('pendingConsentFormCount', '0');
   
  }
    // Start countdown to hide message
    timer = setTimeout(() => {
      setShowAllSignedMessage(false);
    }, 3000);
  // Always update previous pending count
  prevPendingCount.current = currentPendingCount;

  // Cleanup timeout
  return () => {
    if (timer) clearTimeout(timer);
  };
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

      triggerRefresh();
      //  Forcefully check for result === 'success'
      if (response.payload.result === 'success') {
        decrementPendingCount();
        setSnackbarMessage('Signing Complete!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);


        onFormSigned(form.FormID, Signature);
        setCountdown(5);
      }
      else {
        setSnackbarMessage(response.payload.result);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
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


