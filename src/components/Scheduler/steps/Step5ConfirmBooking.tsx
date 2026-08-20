import React, { useState } from 'react';
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
import { AppointmentData } from '../types';
import moment from 'moment';

interface Step5Props {
  onConfirm: () => void;
  onBack: () => void;
  currentData?: AppointmentData;
}

const Step5ConfirmBooking: React.FC<Step5Props> = ({
  onConfirm,
  onBack,
  currentData
}) => {
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setBookingStatus('success');
      setTimeout(() => {
        onConfirm();
      }, 2000);
    } catch (error) {
      setBookingStatus('error');
      setLoading(false);
    }
  };

  if (bookingStatus === 'success') {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
        <CheckCircleOutlineIcon
          sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
        />
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          Appointment Confirmed!
        </Typography>
        <Typography color="text.secondary">
          Your appointment has been successfully booked. You will receive a confirmation
          email shortly.
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
        Confirm Appointment
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
                  {currentData?.reasonForVisit?.appReason}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Visit Type
                </Typography>
                <Typography fontWeight="bold">{currentData?.visitType}</Typography>
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

          {/* Map Preview */}
          <Box
            sx={{
              width: '100%',
              height: 180,
              bgcolor: '#e8f4f8',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary'
            }}
          >
            Map Preview
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
          Failed to confirm appointment. Please try again.
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmBooking}
          disabled={loading}
          sx={{ ml: 'auto' }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Confirming...
            </>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default Step5ConfirmBooking;
