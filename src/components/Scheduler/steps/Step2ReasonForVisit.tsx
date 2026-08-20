import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Stack,
  Paper,
  Typography,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { useDispatch, useSelector } from '@/store/index';
import { Searchappointmentreason } from '@/slices/Schedule';
import { ReasonForVisit, AppointmentData } from '../types';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';

interface Step2Props {
  onNext: (data: AppointmentData) => void;
  onBack: () => void;
  currentData?: AppointmentData;
}

const Step2ReasonForVisit: React.FC<Step2Props> = ({
  onNext,
  onBack,
  currentData
}) => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const { practiceId } = useCurrentPatient();
  const [selectedReason, setSelectedReason] = useState<any>(
    currentData?.reasonForVisit || null
  );

  const {
    appointmentReasons,
    appointmentReasonsLoading,
    appointmentReasonsError
  } = useSelector((state: any) => state.schedule);

  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      dispatch(
        Searchappointmentreason({
          searchTerm,
          practiceId
        }) as any
      );
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, practiceId, dispatch]);

  const handleNext = () => {
    if (!selectedReason) {
      alert('Please select a reason for visit');
      return;
    }
    onNext({ ...currentData, reasonForVisit: selectedReason });
  };

  const getReasons = () => {
    if (!searchTerm.trim()) {
      return [];
    }
    return appointmentReasons || [];
  };

  const reasons = getReasons();

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
        Please select reason for your visit
      </Typography>

      {/* Search Input */}
      <TextField
        fullWidth
        label="Search reason for visit"
        placeholder="e.g., Follow-up, Consultation, Check-up"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        disabled={appointmentReasonsLoading}
      />

      {/* Error Alert */}
      {appointmentReasonsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {appointmentReasonsError}
        </Alert>
      )}

      {/* Loading State */}
      {appointmentReasonsLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={40} />
        </Box>
      )}

      {/* No Results */}
      {!appointmentReasonsLoading &&
        searchTerm.trim().length > 0 &&
        reasons.length === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            No reasons found for "{searchTerm}". Try a different search term.
          </Alert>
        )}

      {/* Reason Cards */}
      {!appointmentReasonsLoading && reasons.length > 0 && (
        <Stack spacing={2}>
          {reasons.map((reason: any) => (
            <Paper
              key={reason.id}
              onClick={() => setSelectedReason(reason)}
              sx={{
                p: 2,
                cursor: 'pointer',
                border: '2px solid',
                borderColor:
                  selectedReason?.id === reason.id
                    ? 'primary.main'
                    : '#e0e0e0',
                bgcolor:
                  selectedReason?.id === reason.id
                    ? 'primary.lighter'
                    : 'white',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 1
                }
              }}
            >
              <Typography fontWeight="bold">{reason.appReason}</Typography>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Initial State - No Search */}
      {!appointmentReasonsLoading && searchTerm.trim().length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ py: 4, textAlign: 'center' }}
        >
          Start typing to search for appointment reasons...
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          sx={{ ml: 'auto' }}
          disabled={!selectedReason || appointmentReasonsLoading}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default Step2ReasonForVisit;
