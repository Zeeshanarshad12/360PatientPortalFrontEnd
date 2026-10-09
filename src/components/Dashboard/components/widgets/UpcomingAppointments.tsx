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
  Stack,
  Alert
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { widgetContent } from '@/components/Dashboard/contexts/widgetData';
import { useDispatch, useSelector } from '@/store/index';
import { useState, useEffect, useMemo } from 'react';
import { getpatientappointments } from '@/slices/patientprofileslice';
import WidgetLoadingRows from '@/components/Dashboard/components/WidgetLoadingRows';
import moment from 'moment';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import { isNull } from '@/utils/functions';
import { SchedulerModal } from '@/components/Scheduler';
import { AppointmentData, Facility } from '@/components/Scheduler/types';
import { mapToFacility } from '@/components/Scheduler/steps/Step1SelectLocation';
import {
  UpdateExistingAppointmentStatus,
  resetUpdateAppointmentStatusError,
  GetProvidersbyPracticeID,
  GetPracticeLocationForPatient
} from '@/slices/ScheduleSlice';
import ConfirmDialog from '@/components/ThemeComponent/ConfirmDialog';
import SnackbarUtils from '@/content/snackbar';

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

// Bug 432553: the EHR now sends the actual SummitEHR Scheduler status
// color as appt.colorHex on every appointment, so that's the source of
// truth (see resolveStatusColor). This guessed palette is now only a
// fallback for older data or if colorHex is ever missing.
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

const isValidHexColor = (value?: string) =>
  !!value && /^#([0-9a-f]{3}){1,2}$/i.test(value);

// Picks readable black/white text against an arbitrary background color,
// since the EHR only sends a background hex, not a matching text color.
const getContrastTextColor = (hex: string) => {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return brightness > 0.6 ? '#000000' : '#ffffff';
};

// Statuses whose EHR color doesn't fit the portal: "Cancelled by Patient"
// comes through as black, so render it with the same red as "Cancelled".
const STATUS_COLOR_OVERRIDES: Record<string, { bgcolor: string; textColor: string }> = {
  'cancelled by patient': { bgcolor: '#ff0000', textColor: '#ffffff' }
};

const resolveStatusColor = (appt: any) => {
  const override =
    STATUS_COLOR_OVERRIDES[appt?.appointmentStatus?.trim().toLowerCase()];
  if (override) return override;
  if (isValidHexColor(appt?.colorHex)) {
    return {
      bgcolor: appt.colorHex,
      textColor: getContrastTextColor(appt.colorHex)
    };
  }
  return getStatusColor(appt?.appointmentStatus);
};

// Bug 432905: Cancel/Reschedule must only be offered for statuses that are
// still an active, future, self-service-eligible appointment (HL7 FHIR
// Appointment.status: proposed/pending/booked). This supersedes Bug 432581
// and Bug 432755's narrower blocklists - everything not explicitly listed
// here (cancelled/rescheduled/denied/deleted/no-show/arrived/completed, in
// any of their spelling variants) is hidden by default rather than only
// the handful of statuses previously enumerated.
const ACTIONABLE_APPOINTMENT_STATUSES = new Set([
  // Requested / Booked
  'requested',
  'patient request',
  'scheduled',
  'pending',
  'pending paperwork',
  // Confirmed / Outreach
  'confirmed',
  'patient confirmed',
  'conf phone',
  'conf sms',
  'text conf',
  'vm to conf',
  'lvm for confirmation',
  'left voice message',
  'no answer',
  'failed msg',
  'sent email message',
  'sent text message',
  'patient was called',
  'patient called',
  // Visit type / Other
  'initial',
  'initial 40 minutes',
  'follow up',
  'follow up 20 minutes',
  'telehealth',
  'lab',
  'prescription only',
  'referrals',
  'other'
]);

const isActionableStatus = (appointmentStatus: string) =>
  ACTIONABLE_APPOINTMENT_STATUSES.has(
    (appointmentStatus || '').trim().toLowerCase()
  );

// Bug 432905: "stay visible (for future-dated appointments only)" - an
// actionable status on a past appointment (e.g. status never got updated)
// must not offer Cancel/Reschedule either.
const isFutureAppointment = (appt: any) =>
  !!appt?.startTime && moment(appt.startTime).isAfter(moment());

const canManageAppointment = (appt: any) =>
  isActionableStatus(appt?.appointmentStatus) && isFutureAppointment(appt);

// Bug 432545: the "Cancelled" status ID in SummitEHR's appointment status list.
const CANCELLED_STATUS_ID = 2;
const CANCELLED_STATUS_NAME = 'Cancelled by Patient';

const UpcomingAppointments: React.FC<Props> = ({ dragHandleProps }) => {
  const dispatch = useDispatch();
  const [appointments, setappointments] = useState([]);
  const [loading, setLoading] = useState(true);
  // Bug 432903: a failed fetch must surface an error, not an unexplained
  // blank widget.
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null
  );
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
  const {
    updateAppointmentStatusLoading,
    updateAppointmentStatusError,
    providers,
    locations
  } = useSelector((state: any) => state.schedule);

  // getpatientappointments returns a raw providerName string that's
  // sometimes malformed (concatenated login-style token) or missing the
  // credential (", MD"). The provider list already renders providerFullName
  // correctly (used as-is on the booking confirmation screen), so prefer
  // that lookup when we have a match and only fall back to the raw
  // appointment field otherwise.
  useEffect(() => {
    if (!isNull(practiceId)) {
      dispatch(GetProvidersbyPracticeID({ practiceId }) as any);
      dispatch(GetPracticeLocationForPatient({ practiceId }) as any);
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

  // Bug 432706: Reschedule must show the same Location Name/Address/Phone
  // as the New Appointment flow, not the raw (often incomplete) address
  // string on the appointment record.
  const facilityByLocationId = useMemo(() => {
    const map: Record<string, Facility> = {};
    (locations || []).forEach((loc: any) => {
      const facility = mapToFacility(loc);
      if (facility.id != null) {
        map[String(facility.id)] = facility;
      }
    });
    return map;
  }, [locations]);

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
        setAppointmentsError(null);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointmentsError(
        'Unable to load appointments. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, practiceId, patientId]);

  const resolveAppointmentId = (appt: any) =>
    appt?.appointmentId ?? appt?.AppointmentId ?? appt?.id ?? null;

  const handleReschedule = (appt: any) => {
    const startDate = appt?.startTime;
    const endDate = appt?.endTime;
    const matchedFacility =
      appt?.locationId != null
        ? facilityByLocationId[String(appt.locationId)]
        : undefined;

    setInitialAppointmentData({
      facility: matchedFacility || {
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
    dispatch(resetUpdateAppointmentStatusError());
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
        UpdateExistingAppointmentStatus({
          appointmentId: appointmentToCancel,
          statusId: CANCELLED_STATUS_ID,
          statusName: CANCELLED_STATUS_NAME,
          practiceId,
          updatedBy: patientId || ''
        })
      ).unwrap();
      handleCloseCancelDialog();
      SnackbarUtils.success('Appointment cancelled successfully.', false);
      fetchAppointments();
    } catch (error) {
      // updateAppointmentStatusError is shown inline in the dialog; keep it open.
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
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
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
              <WidgetLoadingRows />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ minHeight: 250, borderRadius: 3 }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            {/* Header with Schedule Link */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="nowrap"
              gap={0.5}
              mb={2}
            >
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{ fontSize: '1.25rem', flexShrink: 0 }}
              >
                {widgetContent.upcomingAppointments.title}
                <Chip
                  label={appointments.length}
                  color="default"
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    bgcolor: 'black',
                    color: 'white',
                    ml: 1
                  }}
                />
              </Typography>
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{ flexShrink: 0 }}
              >
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleNewAppointment}
                  sx={{ textTransform: 'none', px: 1 }}
                >
                  New Appointment
                </Button>
                <Box {...dragHandleProps}>
                  <IconButton size="small" sx={{ cursor: 'grab', p: 0.5 }}>
                    <DragIndicatorIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Appointments List */}
            {appointmentsError && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                {appointmentsError}
              </Alert>
            )}
            <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1 }}>
              {!appointmentsError && appointments.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 4 }}
                >
                  No upcoming appointments. Click &quot;New Appointment&quot;
                  to request one.
                </Typography>
              )}
              {appointments.map((appt: any, index: number) => {
                const statusColors = resolveStatusColor(appt);
                return (
                  <Box
                    key={index}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      p: 1.5,
                      mb: 1.5,
                      position: 'relative',
                      bgcolor: '#fff'
                    }}
                  >
                    {/* Appointment Type and Doctor */}
                    {/* Title and badge sit side by side so a long status
                        label (e.g. "Cancelled By Patient") wraps the title
                        instead of overlapping it. */}
                    <Box
                      display="flex"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      gap={1}
                      sx={{ mb: 0.5 }}
                    >
                      <Typography fontWeight="bold" sx={{ minWidth: 0 }}>
                        {appt.appointmentType}
                      </Typography>

                      {/* Status Badge */}
                      <Chip
                        label={appt.appointmentStatus}
                        size="small"
                        sx={{
                          flexShrink: 0,
                          fontSize: '0.85rem',
                          borderRadius: '10px',
                          bgcolor: statusColors.bgcolor,
                          color: statusColors.textColor,
                          fontWeight: 'bold',
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
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
                    {canManageAppointment(appt) && (
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
                    )}
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
        loading={updateAppointmentStatusLoading}
        error={updateAppointmentStatusError}
        onConfirm={handleConfirmCancel}
        onClose={handleCloseCancelDialog}
      />
    </>
  );
};

export default UpcomingAppointments;
