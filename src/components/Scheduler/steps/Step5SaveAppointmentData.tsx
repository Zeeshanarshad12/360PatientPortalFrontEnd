import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Avatar
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useDispatch, useSelector } from '@/store/index';
import {
  CreatePatientAppointment,
  UpdatePatientAppointment
} from '@/slices/ScheduleSlice';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import { AppointmentData } from '../types';
import moment from 'moment';

interface Step5Props {
  onConfirm: () => void;
  onSuccess?: () => void;
  onBack: () => void;
  currentData?: AppointmentData;
  appointmentId?: string | number | null;
}

const DEFAULT_SLOT_DURATION_MINUTES = 15;

const Step5SaveAppointmentData: React.FC<Step5Props> = ({
  onConfirm,
  onSuccess,
  onBack,
  currentData,
  appointmentId
}) => {
  const dispatch = useDispatch();
  const { patientId, practiceId } = useCurrentPatient();
  const isReschedule = !!appointmentId;
  const {
    createAppointmentLoading,
    createAppointmentError,
    createdAppointment,
    updateAppointmentLoading,
    updateAppointmentError,
    updatedAppointment
  } = useSelector((state: any) => state.schedule);

  const submitLoading = isReschedule
    ? updateAppointmentLoading
    : createAppointmentLoading;
  const submitError = isReschedule ? updateAppointmentError : createAppointmentError;
  const submitResult = isReschedule ? updatedAppointment : createdAppointment;

  const [submitted, setSubmitted] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  useEffect(() => {
    if (!submitted) return;
    if (submitResult) {
      setBookingStatus('success');
      onSuccess?.();
      setTimeout(() => {
        onConfirm();
      }, 2000);
    } else if (submitError) {
      setBookingStatus('error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitResult, submitError, submitted]);

  const buildAppointmentPayload = () => {
    const startMoment = moment(
      `${currentData?.date} ${currentData?.time}`,
      'YYYY-MM-DD hh:mm A'
    );
    const durationMinutes =
      currentData?.slotDurationMinutes || DEFAULT_SLOT_DURATION_MINUTES;
    const endMoment = startMoment.clone().add(durationMinutes, 'minutes');

    return {
      isDeleted: false,
      patientId: Number(patientId),
      practiceId: Number(practiceId),
      reasonString: currentData?.reasonForVisit?.appReason || '',
      providerId: currentData?.provider?.providerId,
      encounterProviderId: '',
      locationId: currentData?.facility?.id,
      comments: '',
      startDate: startMoment.toISOString(),
      endDate: endMoment.toISOString(),
      occurances: 0,
      recurranceRule: '',
      typeId: currentData?.appointmentType?.id,
      dateOfService: moment().toISOString(),
      reasonForVisit: '',
      statusId: 12,
      recurringInterval: 0,
      recurringDay: 0,
      recurringWeekdayOfMonth: 0,
      recurringMonthlyFreq: 0,
      recurringDailyFreq: 0,
      recurringWeeklyFreq: 0,
      joinable: true,
      roomId: '',
      id: isReschedule ? Number(appointmentId) : 0,
      isRecurring: false,
      occurenceBool: '',
      statusValidate: false,
      reasonStringAdd: false
    };
  };

  const handleConfirmBooking = () => {
    debugger;
    setBookingStatus('idle');
    setSubmitted(true);
    const payload = buildAppointmentPayload();
    if (isReschedule) {
      dispatch(UpdatePatientAppointment(payload) as any);
    } else {
      dispatch(CreatePatientAppointment(payload) as any);
    }
  };

  if (bookingStatus === 'success') {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
        <CheckCircleOutlineIcon
          sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
        />
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          {isReschedule ? 'Appointment Rescheduled!' : 'Appointment Confirmed!'}
        </Typography>
        <Typography color="text.secondary">
          {isReschedule
            ? 'Your appointment has been successfully rescheduled. You will receive a confirmation email shortly.'
            : 'Your appointment has been successfully booked. You will receive a confirmation email shortly.'}
        </Typography>
      </Box>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
        {isReschedule ? 'Confirm Reschedule' : 'Confirm Appointment'}
      </Typography>

      {/* Summary Card */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: 'primary.lighter',
          border: '1px solid',
          borderColor: 'primary.light'
        }}
      >
        <Stack spacing={3}>
          {/* Provider Info */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                width: 56,
                height: 56
              }}
            >
              {getInitials(currentData?.provider?.providerFullName || 'Dr')}
            </Avatar>
            <Box>
              <Typography fontWeight="bold">
                {currentData?.provider?.providerFullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentData?.provider?.providerSpeciality}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
            {/* Appointment Details */}
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Appointment Type
                </Typography>
                <Typography fontWeight="bold">
                  {currentData?.appointmentType?.text}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Reason for Visit
                </Typography>
                <Typography fontWeight="bold">
                  {currentData?.reasonForVisit?.appReason}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography fontWeight="bold">
                  {moment(currentData?.date).format('MMMM D, YYYY')} at{' '}
                  {currentData?.time}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Location
                </Typography>
                <Typography fontWeight="bold">
                  {currentData?.facility?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentData?.facility?.address}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Notification Banner */}
      <Alert
        icon={<NotificationsIcon />}
        severity="info"
        sx={{ mb: 3, bgcolor: 'info.lighter' }}
      >
        <Typography variant="body2">
          You will receive a confirmation notification once the provider accepts your
          appointment. A reminder will be sent 24 hours before.
        </Typography>
      </Alert>

      {/* Error Alert */}
      {bookingStatus === 'error' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError ||
            (isReschedule
              ? 'Failed to reschedule appointment. Please try again.'
              : 'Failed to confirm appointment. Please try again.')}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onBack} disabled={submitLoading}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmBooking}
          disabled={submitLoading}
          sx={{ ml: 'auto' }}
        >
          {submitLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              {isReschedule ? 'Updating...' : 'Confirming...'}
            </>
          ) : isReschedule ? (
            'Update'
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default Step5SaveAppointmentData;
