import React, { useState, useEffect, useMemo } from 'react';
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
import { Searchappointmentreason } from '@/slices/ScheduleSlice';
import { ReasonForVisit, AppointmentData } from '../types';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';

interface Step2Props {
  onNext: (data: AppointmentData) => void;
  onBack: () => void;
  currentData?: AppointmentData;
}

const Step2SelectAppointmentReason: React.FC<Step2Props> = ({
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
    dispatch(Searchappointmentreason({ searchTerm: '', practiceId }) as any);
  }, [practiceId, dispatch]);

  const handleNext = () => {
    if (!selectedReason) {
      alert('Please select a reason for visit');
      return;
    }
    onNext({ ...currentData, reasonForVisit: selectedReason });
  };

  const reasons = useMemo(() => {
    const list = appointmentReasons || [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;
    return list.filter((reason: any) =>
      (reason.appReason || '').toLowerCase().includes(term)
    );
  }, [appointmentReasons, searchTerm]);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
        Please select reason for your visit
      </Typography>

      {selectedReason ? (
        /* Selected Reason Summary */
        <Box sx={{ mb: 3 }}>
          <Paper
            sx={{
              p: 2,
              border: '2px solid',
              borderColor: 'primary.main',
              bgcolor: 'primary.lighter'
            }}
          >
            <Typography fontWeight="bold">
              {selectedReason.appReason}
            </Typography>
          </Paper>
          <Button
            size="small"
            onClick={() => {
              setSelectedReason(null);
              setSearchTerm('');
            }}
            sx={{ mt: 1 }}
          >
            Change Reason
          </Button>
        </Box>
      ) : (
        <>
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
          {!appointmentReasonsLoading && reasons.length === 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {searchTerm.trim()
                ? `No reasons found for "${searchTerm}". Try a different search term.`
                : 'No appointment reasons available.'}
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
                  <Typography fontWeight="bold">
                    {reason.appReason}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          sx={{ ml: 'auto' }}
          disabled={!selectedReason}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default Step2SelectAppointmentReason;
