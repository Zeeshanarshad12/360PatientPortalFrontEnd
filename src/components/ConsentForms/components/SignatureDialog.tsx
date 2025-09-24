import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Fade,
  Alert,
} from '@mui/material';
import SignatureCanvas from 'react-signature-canvas';
const ReactSignatureCanvas = SignatureCanvas as any;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (Signature: string) => void;
}

const SignatureDialog = ({ open, onClose, onSave }: Props) => {
  const sigRef = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'signature' | 'photograph'>('signature');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [fadeIn, setFadeIn] = useState(true);

  const handleClear = () => {
    setError('');
    if (mode === 'signature') {
      sigRef.current?.clear();
    } else {
      setPhotoDataUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = () => {
    setError('');
    if (mode === 'signature') {
      const Signature = sigRef.current?.getTrimmedCanvas().toDataURL('image/png');
      if (Signature && !sigRef.current?.isEmpty()) {
        onSave(Signature);
      } else {
        setError('Please provide a valid signature.');
      }
    } else if (mode === 'photograph') {
      if (photoDataUrl) {
        onSave(photoDataUrl);
      } else {
        setError('Please upload a photograph.');
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPG and PNG files are allowed.');
      setPhotoDataUrl(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoDataUrl(reader.result as string);
      setFadeIn(true);
      setError('');
    };
    reader.readAsDataURL(file);
  }
};

useEffect(() => {
  if (open) {
    setError('');
  }
}, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Signature</DialogTitle>
      <DialogContent>
        <Typography variant="body2" mb={2}>
          Add your eSignature to your consent form using mouse/touchpad or upload a photograph.
        </Typography>

        <RadioGroup
          row
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as 'signature' | 'photograph');
            setError('');
          }}
        >
          <FormControlLabel value="signature" control={<Radio />} label="Signature" />
          <FormControlLabel value="photograph" control={<Radio />} label="Photograph" />
        </RadioGroup>

        {error && (
          <Fade in={!!error}>
            <Box mt={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          </Fade>
        )}

        {mode === 'signature' && (
          <>
            <Box
              sx={{
                border: '1px dashed #ccc',
                p: 2,
                mt: 2,
                textAlign: 'center',
                background: '#f9f9f9',
              }}
            >

              <ReactSignatureCanvas
                ref={sigRef}
                canvasProps={{ width: 500, height: 150, className: 'sigCanvas' }}
              />

            </Box>
            <Box sx={{ mt: 1, textAlign: 'right' }}>
              <Button onClick={handleClear} size="small">
                Clear Signature
              </Button>
            </Box>
          </>
        )}

        {mode === 'photograph' && (
          <>
            <Box sx={{ mt: 3 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg"
                onChange={handlePhotoUpload}
                hidden
                id="upload-photo"
              />
              <label htmlFor="upload-photo">
                <Button variant="outlined" component="span">
                  Choose Photo
                </Button>
              </label>
            </Box>

            <Fade in={!!photoDataUrl}>
              <Box
                sx={{
                  mt: 2,
                  border: '1px dashed #ccc',
                  borderRadius: 1,
                  background: '#f9f9f9',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  height: 160,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={photoDataUrl || ''}
                  alt="Uploaded"
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </Box>
            </Fade>

            {photoDataUrl && (
              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Button onClick={handleClear} size="small">
                  Clear Photo
                </Button>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={mode === 'photograph' && !photoDataUrl}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignatureDialog;