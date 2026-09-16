import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Link,
  Button,
  Stack
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { widgetContent } from '@/components/Dashboard/contexts/widgetData';
import { useDispatch, useSelector } from '@/store/index';
import { useState, useEffect, useMemo } from 'react';
import { getpatientappointments } from '@/slices/patientprofileslice';
import CircularProgressLoader from '@/components/ProgressLoaders/components/Circular';
import moment from 'moment';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import { isNull } from '@/utils/functions';
import { SchedulerModal } from '@/components/Scheduler';
import { AppointmentData } from '@/components/Scheduler/types';
import {
  DeleteAppointmentById,
  resetDeleteAppointmentError,
  GetProvidersbyPracticeID
} from '@/slices/ScheduleSlice';
import ConfirmDialog from '@/components/ThemeComponent/ConfirmDialog';
import SnackbarUtils from '@/content/snackbar';

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

// Mirrors the appointment status colors configured in the EHR Scheduler's
// status dropdown so a status reads the same way in both apps. TODO:
// confirm these hex values with design/TPM against the EHR scheduler's
// actual palette - it isn't defined anywhere in this frontend, so this is a
// best-effort mapping covering every status the scheduler exposes rather
// than only the two this widget originally knew.
const STATUS_COLORS: Record<string, { bgcolor: string; textColor: string }> = {
  scheduled: { bgcolor: '#e3f2fd', textColor: '#1565c0' },
  confirmed: { bgcolor: '#e8f5e9', textColor: '#2e7d32' },
  'check-in': { bgcolor: '#e0f7fa', textColor: '#00838f' },
  completed: { bgcolor: '#2e7d32', textColor: 'white' },
  cancelled: { bgcolor: '#ffebee', textColor: '#c62828' },
  'doctor cancelled': { bgcolor: '#ffebee', textColor: '#c62828' },
  deleted: { bgcolor: '#ffebee', textColor: '#c62828' },
  deny: { bgcolor: '#fce4ec', textColor: '#ad1457' },
  denied: { bgcolor: '#fce4ec', textColor: '#ad1457' },
  'no show': { bgcolor: '#fff3e0', textColor: '#e65100' },
  'in lobby': { bgcolor: '#ede7f6', textColor: '#5e35b1' },
  'in room': { bgcolor: '#ede7f6', textColor: '#5e35b1' },
  'patient request': { bgcolor: '#fff8e1', textColor: '#f57f17' },
  requested: { bgcolor: '#fff8e1', textColor: '#f57f17' },
  rescheduled: { bgcolor: '#e1f5fe', textColor: '#0277bd' },
  'doctor rescheduled': { bgcolor: '#e1f5fe', textColor: '#0277bd' },
  'left voice message': { bgcolor: '#f3e5f5', textColor: '#6a1b9a' },
  'patient called': { bgcolor: '#fff3e0', textColor: '#ef6c00' },
  'patient hospitalized': { bgcolor: '#fbe9e7', textColor: '#bf360c' },
  'patient relocation': { bgcolor: '#fbe9e7', textColor: '#bf360c' },
  'sent text message': { bgcolor: '#fce4ec', textColor: '#ad1457' }
};

const getStatusColor = (appointmentStatus: string) =>
  STATUS_COLORS[appointmentStatus?.toLowerCase()] || {
    bgcolor: '#e0e0e0',
    textColor: '#666'
  };

const UpcomingAppointments: React.FC<Props> = ({ dragHandleProps }) => {
  const dispatch = useDispatch();
  const [appointments, setappointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { patientId, practiceId } = useCurrentPatient();
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | number | null
  >(null);
  const [initialAppointmentData, setInitialAppointmentData] = useState<
    AppointmentData | undefined
  >(undefined);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<
    string | number | null
  >(null);
  const { deleteAppointmentLoading, deleteAppointmentError, providers } =
    useSelector((state: any) => state.schedule);

  // getpatientappointments returns a raw providerName string that's
  // sometimes malformed (concatenated login-style token) or missing the
  // credential (", MD"). The provider list already renders providerFullName
  // correctly (used as-is on the booking confirmation screen), so prefer
  // that lookup when we have a match and only fall back to the raw
  // appointment field otherwise.
  useEffect(() => {
    if (!isNull(practiceId)) {
      dispatch(GetProvidersbyPracticeID({ practiceId }) as any);
    }
  }, [practiceId, dispatch]);

  const providerNameById = useMemo(() => {
    const map: Record<string, string> = {};
    (providers || []).forEach((p: any) => {
      if (p?.providerId != null) {
        map[String(p.providerId)] = p.providerFullName;
      }
    });
    return map;
  }, [providers]);

  const getDisplayProviderName = (appt: any) =>
    (appt?.providerId != null && providerNameById[String(appt.providerId)]) ||
    appt.providerName;

  const fetchAppointments = async () => {
    try {
      if (!isNull(patientId) && !isNull(practiceId)) {
        const Obj = {
          PatientId: patientId,
          PracticeId: practiceId
        };

        const response = await dispatch(getpatientappointments(Obj)).unwrap();
        const data = response.result;
        setappointments(data);
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, practiceId, patientId]);

  const resolveAppointmentId = (appt: any) => appt?.appointmentId ?? null;

  const handleReschedule = (appt: any) => {
    const startDate = appt?.startTime;
    const endDate = appt?.endTime;

    setInitialAppointmentData({
      facility: {
        id: appt?.locationId,
        name: appt.providerLocation || appt.address || 'Selected Location',
        address: appt.address || ''
      },
      provider: {
        providerId: appt?.providerId,
        firstName: '',
        lastName: '',
        providerFullName: appt.providerName || '',
        providerSpecialty: ''
      },
      reasonForVisit: {
        id: 0,
        appReason: appt.appointmentReason || '',
        isActive: true,
        totalCount: 0
      },
      appointmentType: appt.appointmentType
        ? { text: appt.appointmentType }
        : undefined,
      date: startDate ? moment(startDate).format('YYYY-MM-DD') : undefined,
      time: startDate ? moment(startDate).format('hh:mm A') : undefined,
      slotDurationMinutes:
        startDate && endDate
          ? moment(endDate).diff(moment(startDate), 'minutes')
          : undefined
    });
    setSelectedAppointmentId(resolveAppointmentId(appt));
    setSchedulerOpen(true);
  };

  const handleCancel = (appointmentId: string | number | null) => {
    dispatch(resetDeleteAppointmentError());
    setAppointmentToCancel(appointmentId);
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setAppointmentToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (appointmentToCancel === null) return;
    try {
      await dispatch(
        DeleteAppointmentById({
          appointmentId: appointmentToCancel,
          series: false
        })
      ).unwrap();
      handleCloseCancelDialog();
      SnackbarUtils.success('Appointment cancelled successfully.', false);
      fetchAppointments();
    } catch (error) {
      // deleteAppointmentError is shown inline in the dialog; keep it open.
    }
  };

  const handleNewAppointment = () => {
    setSelectedAppointmentId(null);
    setInitialAppointmentData(undefined);
    setSchedulerOpen(true);
  };

  const handleSchedulerConfirm = (appointmentData: AppointmentData) => {
    fetchAppointments();
  };

  const handleSchedulerClose = () => {
    setSchedulerOpen(false);
    setSelectedAppointmentId(null);
  };

  return (
    <>
      {loading ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ pb: 1 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
              mb={2}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ fontSize: '1.25rem' }}
              >
                {widgetContent.upcomingAppointments.title}
              </Typography>
            </Box>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgressLoader />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ minHeight: 250, borderRadius: 3 }}>
          <CardContent sx={{ pb: 1 }}>
            {/* Header with Schedule Link */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
              mb={2}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ fontSize: '1.25rem' }}
              >
                {widgetContent.upcomingAppointments.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleNewAppointment}
                  sx={{ textTransform: 'none' }}
                >
                  New Appointment
                </Button>
                <Box {...dragHandleProps}>
                  <IconButton size="small" sx={{ cursor: 'grab' }}>
                    <DragIndicatorIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Appointments List */}
            <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1 }}>
              {appointments.map((appt: any, index: number) => {
                const statusColors = getStatusColor(appt.appointmentStatus);
                return (
                  <Box
                    key={index}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      p: 2,
                      mb: 1.5,
                      position: 'relative',
                      bgcolor: '#fff'
                    }}
                  >
                    {/* Appointment Type and Doctor */}
                    <Typography fontWeight="bold" sx={{ mb: 0.5, pr: 8 }}>
                      {appt.appointmentType}

                      {/* Status Badge */}
                      <Chip
                        label={appt.appointmentStatus}
                        size="small"
                        sx={{
                          position: 'absolute',
                          right: 15,
                          fontSize: '0.85rem',
                          borderRadius: '10px',
                          bgcolor: statusColors.bgcolor,
                          color: statusColors.textColor,
                          fontWeight: 'bold',
                          textTransform: 'capitalize'
                        }}
                      />
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ mb: 1 }}
                    >
                      {getDisplayProviderName(appt)}
                    </Typography>
                    {/* Date, Time, Location */}
                    <Box display="flex" alignItems="center" sx={{ mb: 0.5 }}>
                      <CalendarTodayIcon
                        sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1 }}
                      >
                        {moment(appt.appointmentDate).format('MM/DD/YYYY')}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 0.5 }}
                      >
                        |
                      </Typography>
                      <AccessTimeIcon
                        sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {moment(appt.startTime).format('hh:mm A') +
                          ' - ' +
                          moment(appt.endTime).format('hh:mm A')}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <LocationOnIcon
                        sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {appt.address}
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Stack direction="row" gap={1} sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => handleReschedule(appt)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        color="error"
                        onClick={() => handleCancel(resolveAppointmentId(appt))}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Scheduler Modal */}
      <SchedulerModal
        open={schedulerOpen}
        onClose={handleSchedulerClose}
        onConfirm={handleSchedulerConfirm}
        appointmentId={selectedAppointmentId}
        initialAppointmentData={initialAppointmentData}
      />

      {/* Cancel Appointment Confirmation */}
      {/* Reminds the patient of the practice's late-cancellation/no-show
          policy generically, since the fee/hour threshold varies by
          practice and isn't something this dialog should hardcode. */}
      <ConfirmDialog
        open={cancelDialogOpen}
        title="Cancel Appointment?"
        message={
          <>
            Are you sure you want to cancel this appointment? This action
            cannot be undone.
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ display: 'block', mt: 1.5 }}
            >
              Note: Cancelling with less than 24 hours&apos; notice, or not
              showing up for your appointment, may result in a cancellation
              or no-show fee per our office policy. See the Cancellation, No
              Show &amp; Late Arrival Policy consent form for more details.
            </Typography>
          </>
        }
        confirmText="Cancel Appointment"
        cancelText="Keep Appointment"
        confirmColor="error"
        loading={deleteAppointmentLoading}
        error={deleteAppointmentError}
        onConfirm={handleConfirmCancel}
        onClose={handleCloseCancelDialog}
      />
    </>
  );
};

export default UpcomingAppointments;
