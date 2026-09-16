import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useDispatch, useSelector } from '@/store/index';
import {
  Searchappointmentreason,
  GetAllAppointmentType
} from '@/slices/ScheduleSlice';
import { AppointmentData, AppointmentTypeOption } from '../types';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import StepLayout from './StepLayout';

interface Step2Props {
  onNext: (data: AppointmentData) => void;
  onBack: () => void;
  currentData?: AppointmentData;
  stepNumber?: number;
  stepLabel?: string;
}

const normalizeText = (value?: string) =>
  (value || '').trim().replace(/\s+/g, ' ').toLowerCase();

const Step2SelectAppointmentReason: React.FC<Step2Props> = ({
  onNext,
  onBack,
  currentData,
  stepNumber,
  stepLabel
}) => {
  const dispatch = useDispatch();
  const { practiceId } = useCurrentPatient();
  const [selectedReason, setSelectedReason] = useState<any>(
    currentData?.reasonForVisit || null
  );
  const [selectedAppointmentType, setSelectedAppointmentType] =
    useState<AppointmentTypeOption | null>(currentData?.appointmentType || null);

  const {
    appointmentReasons,
    appointmentReasonsLoading,
    appointmentReasonsError,
    appointmentTypes,
    appointmentTypesLoading,
    appointmentTypesError
  } = useSelector((state: any) => state.schedule);

  useEffect(() => {
    dispatch(
      Searchappointmentreason({
        searchTerm: '',
        practiceId,
        patientOnly: true
      }) as any
    );
  }, [practiceId, dispatch]);

  useEffect(() => {
    dispatch(GetAllAppointmentType({ PracticeId: practiceId }) as any);
  }, [practiceId, dispatch]);

  // Reschedule flow only knows the appointment type's display text up front
  // (see UpcomingAppointments.tsx), not its id/duration. Once the real list
  // loads, swap the text-only placeholder for the matching full record so
  // the correct card highlights and Step4's duration math has slotDuration.
  useEffect(() => {
    if (!selectedAppointmentType || !appointmentTypes?.length) return;
    if (selectedAppointmentType.id) return;
    const targetText = normalizeText(selectedAppointmentType.text);
    const match = appointmentTypes.find(
      (type: AppointmentTypeOption) => normalizeText(type.text) === targetText
    );
    if (match) {
      setSelectedAppointmentType(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentTypes]);

  // TPM feedback: inactive reasons must not be shown to the patient.
  const reasons = useMemo(
    () =>
      (appointmentReasons || []).filter(
        (reason: any) => reason.isActive !== false
      ),
    [appointmentReasons]
  );

  const isReasonSelected = (reason: any) =>
    selectedReason?.id === reason.id ||
    (!!selectedReason?.appReason &&
      selectedReason.appReason === reason.appReason);

  const isTypeSelected = (type: AppointmentTypeOption) =>
    selectedAppointmentType?.id === type.id ||
    (!selectedAppointmentType?.id &&
      normalizeText(selectedAppointmentType?.text) === normalizeText(type.text));

  const handleNext = () => {
    if (!selectedReason) {
      alert('Please select a reason for visit');
      return;
    }
    if (!selectedAppointmentType) {
      alert('Please select an appointment type');
      return;
    }
    onNext({
      ...currentData,
      reasonForVisit: selectedReason,
      appointmentType: selectedAppointmentType
    });
  };

  return (
    <StepLayout
      stepNumber={stepNumber}
      stepLabel={stepLabel}
      footer={
        <>
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ ml: 'auto' }}
            disabled={!selectedReason || !selectedAppointmentType}
          >
            Continue
          </Button>
        </>
      }
    >
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.75 }}>
        Select reason for your visit
      </Typography>

      {appointmentReasonsError && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {appointmentReasonsError}
        </Alert>
      )}

      {appointmentReasonsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          <Chip
            size="small"
            label="All"
            onClick={() => setSelectedReason(null)}
            color={!selectedReason ? 'primary' : 'default'}
            variant={!selectedReason ? 'filled' : 'outlined'}
          />
          {reasons.map((reason: any) => (
            <Chip
              key={reason.id}
              size="small"
              label={reason.appReason}
              onClick={() => setSelectedReason(reason)}
              color={isReasonSelected(reason) ? 'primary' : 'default'}
              variant={isReasonSelected(reason) ? 'filled' : 'outlined'}
            />
          ))}
          {reasons.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No appointment reasons available.
            </Typography>
          )}
        </Box>
      )}

      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        Select Appointment Type
      </Typography>

      {appointmentTypesError && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {appointmentTypesError}
        </Alert>
      )}

      {appointmentTypesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (appointmentTypes || []).length === 0 ? (
        <Alert severity="info">No appointment types available.</Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {(appointmentTypes || []).map((type: AppointmentTypeOption) => {
            const selected = isTypeSelected(type);
            return (
              <Paper
                key={type.id}
                onClick={() =>
                  !type.disableType && setSelectedAppointmentType(type)
                }
                sx={{
                  py: 1,
                  px: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: type.disableType ? 'not-allowed' : 'pointer',
                  opacity: type.disableType ? 0.5 : 1,
                  border: '2px solid',
                  borderColor: selected ? 'primary.main' : '#e0e0e0',
                  bgcolor: selected ? 'primary.lighter' : 'white',
                  transition: 'all 0.2s',
                  '&:hover': type.disableType
                    ? undefined
                    : { borderColor: 'primary.main', boxShadow: 1 }
                }}
              >
                <Box>
                  <Typography fontWeight="bold" variant="body2">
                    {type.text}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: 'text.secondary',
                      mt: 0.25
                    }}
                  >
                    <AccessTimeIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption">
                      {type.slotDuration ? `${type.slotDuration} minutes` : '—'}
                    </Typography>
                  </Box>
                </Box>
                <ArrowForwardIcon
                  fontSize="small"
                  color={selected ? 'primary' : 'action'}
                />
              </Paper>
            );
          })}
        </Box>
      )}
    </StepLayout>
  );
};

export default Step2SelectAppointmentReason;
