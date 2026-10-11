import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Grid,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useDispatch, useSelector } from '@/store/index';
import { GetProviderLocationScheduleInfo } from '@/slices/ScheduleSlice';
import { AppointmentData } from '../types';
import moment from 'moment';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import StepLayout from './StepLayout';
import { getAuth0UserId } from '@/utils/functions';

interface Step4Props {
  onNext: (data: AppointmentData) => void;
  onBack: () => void;
  currentData?: AppointmentData;
}

const SLOTS_PER_DAY = 5;
// Bug 432588 (Issue 2): the old code only ever generated 14 days of dates
// total, which blocked "Next" after ~2 weeks out. There's no real
// business/product rule in this codebase for a max advance-booking window,
// so this is a generous stand-in (~1 year) rather than a verified limit —
// confirm with backend/product whether an actual cap should replace it.
const MAX_WEEKS_AHEAD = 52;

interface AvailableSlot {
  dateStr: string; // YYYY-MM-DD, wall-clock date of the slot
  time: string; // hh:mm A, wall-clock start time
  startMs: number;
  endMs: number;
}

// availableSlots come with the practice's UTC offset (e.g. +05:00) and a
// pre-formatted startTime; parseZone keeps that wall-clock date/time instead
// of shifting it into the browser's timezone.
const toAvailableSlot = (slot: any): AvailableSlot | null => {
  const start = moment.parseZone(slot?.startDate);
  const end = moment.parseZone(slot?.endDate);
  if (!start.isValid() || !end.isValid() || !end.isAfter(start)) return null;
  return {
    dateStr: start.format('YYYY-MM-DD'),
    time: slot?.startTime || start.format('hh:mm A'),
    startMs: start.valueOf(),
    endMs: end.valueOf()
  };
};

const getInitials = (name?: string) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('');

const Step4SelectProviderSchedule: React.FC<Step4Props> = ({
  onNext,
  onBack,
  currentData
}) => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(currentData?.date || '');
  const [selectedTime, setSelectedTime] = useState(currentData?.time || '');
  const [currentWeekStart, setCurrentWeekStart] = useState(0);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  // Chosen back in Step2 alongside the reason for visit; this step only
  // reads it (for the duration math below) and displays it read-only.
  const selectedAppointmentType = currentData?.appointmentType || null;

  const {
    selectedLocation,
    providerScheduleInfo,
    providerScheduleInfoLoading,
    providerScheduleInfoError
  } = useSelector((state: any) => state.schedule);
  const location = selectedLocation || currentData?.facility;
  const provider = currentData?.provider;
  const providerId = provider?.providerId;

  const { practiceId } = useCurrentPatient();

  useEffect(() => {
    if (providerId && location?.id) {
      dispatch(
        GetProviderLocationScheduleInfo({
          providerIds: [providerId],
          locationId: Number(location.id),
          practiceId: Number(practiceId),
          auth0UserId: getAuth0UserId()
        }) as any
      );
    }
  }, [providerId, location?.id, practiceId, dispatch]);

  // TODO: remove once the new schedule endpoint's data is verified on QA.
  useEffect(() => {
    console.log('[Step4] providerScheduleInfo response:', providerScheduleInfo);
  }, [providerScheduleInfo]);

  const isForThisProviderLocation = (item: any) =>
    String(item?.providerId) === String(providerId) &&
    (item?.locationId == null || String(item.locationId) === String(location?.id));

  const scheduleItems = useMemo(
    () =>
      (providerScheduleInfo?.providerLocationSchedulerItems || []).filter(
        isForThisProviderLocation
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [providerScheduleInfo, providerId, location?.id]
  );

  // Bug 432488 (Issue 3) / 432494 (Issue 1): a provider with no work schedule
  // at this location can't be booked here, so say so instead of showing
  // an empty "no times" state.
  const hasNoSchedule =
    !!providerScheduleInfo &&
    !providerScheduleInfoLoading &&
    scheduleItems.length === 0;

  // Bug 432488 (Issue 2) / 432502: slots now come from the backend, which
  // already applies the provider's own slot size, breaks, holidays and
  // existing appointments (providerBusyTimes). A slot is only offered as a
  // start time when the selected appointment type's *full duration* fits in
  // consecutive free slots from there, so a 40-minute visit is never offered
  // where it would run into another appointment, a break or closing time.
  const slotsByDate = useMemo(() => {
    const slots: AvailableSlot[] = (providerScheduleInfo?.availableSlots || [])
      .filter(isForThisProviderLocation)
      .map(toAvailableSlot)
      .filter((slot: AvailableSlot | null): slot is AvailableSlot => !!slot)
      .sort((a: AvailableSlot, b: AvailableSlot) => a.startMs - b.startMs);

    // Drop duplicate starts so each slot is counted once.
    const unique = slots.filter(
      (slot, i) => i === 0 || slot.startMs !== slots[i - 1].startMs
    );

    const durationMs = (selectedAppointmentType?.slotDuration || 0) * 60000;
    const nowMs = Date.now();
    const map: Record<string, string[]> = {};
    unique.forEach((slot, i) => {
      if (slot.startMs < nowMs) return;
      // Extend through back-to-back free slots until the duration is covered.
      let freeUntil = slot.endMs;
      for (
        let j = i + 1;
        j < unique.length &&
        freeUntil - slot.startMs < durationMs &&
        unique[j].startMs === freeUntil;
        j++
      ) {
        freeUntil = unique[j].endMs;
      }
      if (freeUntil - slot.startMs < durationMs) return;
      (map[slot.dateStr] = map[slot.dateStr] || []).push(slot.time);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerScheduleInfo, providerId, location?.id, selectedAppointmentType]);

  const hasAnyAvailableSlot = Object.keys(slotsByDate).length > 0;

  // Bug 432588 (Issue 1): weeks must follow a real Monday-Sunday boundary.
  // The current week starts from today and runs through that week's Sunday
  // (so Sat/Sun only appear if the provider has availability that day);
  // every week after that is a full Monday-through-Sunday range.
  const weekDates = useMemo(() => {
    const mondayOfWeek = moment()
      .add(currentWeekStart, 'weeks')
      .startOf('isoWeek');
    const rangeStart =
      currentWeekStart === 0 ? moment().startOf('day') : mondayOfWeek;
    const rangeEnd = mondayOfWeek.clone().endOf('isoWeek');
    const dates: string[] = [];
    const cursor = rangeStart.clone();
    while (cursor.isSameOrBefore(rangeEnd, 'day')) {
      dates.push(cursor.format('YYYY-MM-DD'));
      cursor.add(1, 'day');
    }
    return dates;
  }, [currentWeekStart]);

  const maxWeeks = MAX_WEEKS_AHEAD;

  const todayStr = moment().format('YYYY-MM-DD');

  const todayTimes = useMemo(
    () => (slotsByDate[todayStr] || []).slice(0, SLOTS_PER_DAY),
    [slotsByDate, todayStr]
  );

  const weekTimesByDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    weekDates.forEach((dateStr) => {
      map[dateStr] = (slotsByDate[dateStr] || []).slice(0, SLOTS_PER_DAY);
    });
    return map;
  }, [weekDates, slotsByDate]);

  const handleSelectSlot = (dateStr: string, time: string) => {
    setSelectedDate(dateStr);
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please complete all fields');
      return;
    }
    const scheduleItem = scheduleItems.find(
      (item: any) => item.dayOfWeek === moment(selectedDate).day()
    );
    onNext({
      ...currentData,
      facility: location,
      date: selectedDate,
      time: selectedTime,
      slotDurationMinutes:
        selectedAppointmentType?.slotDuration ??
        scheduleItem?.appointmentSlotSizeInMinutes
    });
  };

  const formatDate = (dateStr: string) => moment(dateStr).format('D');
  const formatDayOfWeek = (dateStr: string) =>
    moment(dateStr).format('ddd').toUpperCase();

  return (
    <StepLayout
      footer={
        <>
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{ ml: 'auto' }}
            disabled={!selectedDate || !selectedTime}
          >
            Continue
          </Button>
        </>
      }
    >
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Choose Date & Time
      </Typography>

      {location && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 2,
            color: 'text.secondary'
          }}
        >
          <LocationOnIcon fontSize="small" />
          <Typography variant="body2">
            {location.name}
            {location.address ? ` — ${location.address}` : ''}
          </Typography>
        </Box>
      )}

      {providerScheduleInfoError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {providerScheduleInfoError}
        </Alert>
      )}

      {/* Appointment Type — chosen in the previous step; shown read-only here */}
      {selectedAppointmentType && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 2,
            color: 'text.secondary'
          }}
        >
          <AccessTimeIcon fontSize="small" />
          <Typography variant="body2">
            {selectedAppointmentType.text}
            {selectedAppointmentType.slotDuration
              ? ` — ${selectedAppointmentType.slotDuration} minutes`
              : ''}
          </Typography>
        </Box>
      )}

      {showFullSchedule && provider && (
        <Box
          onClick={() => setShowFullSchedule(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            mb: 3,
            borderRadius: 1,
            bgcolor: 'primary.lighter',
            cursor: 'pointer'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                width: 40,
                height: 40
              }}
            >
              {getInitials(provider.providerFullName)}
            </Avatar>
            <Box>
              <Typography fontWeight="bold" variant="body2">
                {provider.providerFullName}
              </Typography>
              <Typography variant="caption" color="primary.main">
                {provider.providerSpecialty}
              </Typography>
            </Box>
          </Box>
          <ExpandLessIcon color="action" />
        </Box>
      )}

      {providerScheduleInfoLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={40} />
        </Box>
      ) : hasNoSchedule ? (
        <Alert severity="info">
          {provider?.providerFullName || 'This provider'} has no schedule at
          this location, so appointments can&apos;t be booked online. Please go
          back and choose another provider.
        </Alert>
      ) : !showFullSchedule ? (
        /* Compact view: today's next available times */
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Next available appointment today at:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap'
            }}
          >
            {todayTimes.length > 0 ? (
              todayTimes.map((time) => (
                <Button
                  key={time}
                  variant={
                    selectedDate === todayStr && selectedTime === time
                      ? 'contained'
                      : 'outlined'
                  }
                  onClick={() => handleSelectSlot(todayStr, time)}
                >
                  {time}
                </Button>
              ))
            ) : (
              // No-availability message needs distinct styling
              // from the "Next available..." label above it.
              <Typography variant="body2" color="warning.main" fontWeight={600}>
                No available times today
              </Typography>
            )}
            {/* Bug 432494 (Issue 3): "More" only when there are times to
                show — today or on a later day the backend returned. */}
            {hasAnyAvailableSlot && (
              <Button variant="text" onClick={() => setShowFullSchedule(true)}>
                More
              </Button>
            )}
          </Box>
        </Box>
      ) : (
        /* Expanded view: multi-day schedule grid */
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              gap: { xs: 1, sm: 0 },
              mb: 2
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Next available appointment this week at:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() =>
                  setCurrentWeekStart(Math.max(0, currentWeekStart - 1))
                }
                disabled={currentWeekStart === 0}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <Chip
                icon={<CalendarTodayIcon fontSize="small" />}
                label={moment(weekDates[0]).format('MMMM YYYY')}
                variant="outlined"
                size="small"
              />
              <IconButton
                size="small"
                onClick={() =>
                  setCurrentWeekStart(
                    Math.min(maxWeeks - 1, currentWeekStart + 1)
                  )
                }
                disabled={currentWeekStart >= maxWeeks - 1}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Mobile: up to 7 day columns don't fit, so scroll sideways
              instead of squashing the time buttons. */}
          <Box sx={{ overflowX: { xs: 'auto', sm: 'visible' }, pb: { xs: 0.5, sm: 0 } }}>
          <Grid
            container
            spacing={1}
            sx={{ minWidth: { xs: weekDates.length * 84, sm: 0 } }}
          >
            {weekDates.map((dateStr) => (
              <Grid item xs={12 / weekDates.length} key={dateStr}>
                <Typography
                  align="center"
                  variant="caption"
                  fontWeight="bold"
                  color="text.secondary"
                  sx={{ display: 'block' }}
                >
                  {formatDayOfWeek(dateStr)}
                </Typography>
                <Typography
                  align="center"
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  {formatDate(dateStr)}
                </Typography>
                <Stack spacing={1}>
                  {weekTimesByDate[dateStr]?.length > 0 ? (
                    weekTimesByDate[dateStr].map((time) => (
                      <Button
                        key={time}
                        fullWidth
                        size="small"
                        variant={
                          selectedDate === dateStr && selectedTime === time
                            ? 'contained'
                            : 'outlined'
                        }
                        onClick={() => handleSelectSlot(dateStr, time)}
                      >
                        {time}
                      </Button>
                    ))
                  ) : (
                    <Typography
                      align="center"
                      variant="caption"
                      color="text.secondary"
                    >
                      —
                    </Typography>
                  )}
                </Stack>
              </Grid>
            ))}
          </Grid>
          </Box>
        </Box>
      )}
    </StepLayout>
  );
};

export default Step4SelectProviderSchedule;
