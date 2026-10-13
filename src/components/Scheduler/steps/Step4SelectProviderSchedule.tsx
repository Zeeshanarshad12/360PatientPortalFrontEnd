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

// Bug 432588 (Issue 2): the old code only ever generated 14 days of dates
// total, which blocked "Next" after ~2 weeks out. There's no real
// business/product rule in this codebase for a max advance-booking window,
// so this is a generous stand-in (~1 year) rather than a verified limit —
// confirm with backend/product whether an actual cap should replace it.
const MAX_WEEKS_AHEAD = 52;

interface AvailableSlot {
  dateStr: string; // YYYY-MM-DD, as sent in strStartDate
  dayName: string; // e.g. "Tue", from the API's dateText
  time: string; // hh:mm A, the API's startTime
  startMs: number; // only for ordering / back-to-back checks
  endMs: number;
}

// Backend owns all time-zone handling: slots are shown exactly as the API
// sends them. strStartDate/strEndDate, startTime and dateText are used as-is
// (no offset, no conversion to the browser's zone); the plain date/time
// values are read as UTC only so they compare consistently.
const readPlainDateTime = (value?: string, fallback?: string) => {
  const plain = value ? moment.utc(value, moment.ISO_8601) : null;
  if (plain && plain.isValid()) return plain;
  // Older responses without str* fields: keep startDate's own date/time.
  const zoned = fallback ? moment.parseZone(fallback) : null;
  return zoned && zoned.isValid() ? moment.utc(zoned.format('YYYY-MM-DDTHH:mm:ss')) : null;
};

const toAvailableSlot = (slot: any): AvailableSlot | null => {
  const start = readPlainDateTime(slot?.strStartDate, slot?.startDate);
  const end = readPlainDateTime(slot?.strEndDate, slot?.endDate);
  if (!start || !end || !end.isAfter(start)) return null;
  return {
    dateStr: start.format('YYYY-MM-DD'),
    dayName:
      (typeof slot?.dateText === 'string' && slot.dateText.split(',')[0].trim()) ||
      start.format('ddd'),
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

  const appointmentDurationMinutes = selectedAppointmentType?.slotDuration || 0;

  // Slots are fetched one week at a time: Monday 12:00 AM through Sunday
  // 11:59:59 PM of the week shown. Opening the step loads the current week;
  // the < / > arrows (currentWeekStart) load the previous/next week.
  useEffect(() => {
    if (providerId && location?.id) {
      const weekStart = moment()
        .add(currentWeekStart, 'weeks')
        .startOf('isoWeek');
      const weekEnd = weekStart.clone().endOf('isoWeek');
      dispatch(
        GetProviderLocationScheduleInfo({
          appointmentDurationMinutes,
          providerIds: [providerId],
          locationId: Number(location.id),
          practiceId: Number(practiceId),
          auth0UserId: getAuth0UserId(),
          // Local wall-clock time with its UTC offset, e.g.
          // 2026-10-12T00:00:00.000+05:00, so "Monday 12 AM" stays Monday.
          fromDate: weekStart.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          toDate: weekEnd.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
        }) as any
      );
    }
  }, [
    providerId,
    location?.id,
    practiceId,
    appointmentDurationMinutes,
    currentWeekStart,
    dispatch
  ]);

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
  const parsedSlots: AvailableSlot[] = useMemo(
    () =>
      (providerScheduleInfo?.availableSlots || [])
        .filter(isForThisProviderLocation)
        .map(toAvailableSlot)
        .filter((slot: AvailableSlot | null): slot is AvailableSlot => !!slot)
        .sort((a: AvailableSlot, b: AvailableSlot) => a.startMs - b.startMs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [providerScheduleInfo, providerId, location?.id]
  );

  const slotsByDate = useMemo(() => {
    const slots = parsedSlots;

    // Drop duplicate starts so each slot is counted once.
    const unique = slots.filter(
      (slot, i) => i === 0 || slot.startMs !== slots[i - 1].startMs
    );

    const durationMs = (selectedAppointmentType?.slotDuration || 0) * 60000;
    const map: Record<string, string[]> = {};
    unique.forEach((slot, i) => {
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
  }, [parsedSlots, selectedAppointmentType]);

  const hasAnyAvailableSlot = Object.keys(slotsByDate).length > 0;

  // Bug 432588 (Issue 1): weeks follow a real Monday-Sunday boundary. Only
  // days that actually have bookable times are shown as columns — e.g. if
  // the provider isn't available Monday, the week starts at Tuesday.
  const weekMonday = useMemo(
    () => moment().add(currentWeekStart, 'weeks').startOf('isoWeek'),
    [currentWeekStart]
  );

  const weekDates = useMemo(() => {
    const from = weekMonday.format('YYYY-MM-DD');
    const to = weekMonday.clone().endOf('isoWeek').format('YYYY-MM-DD');
    return Object.keys(slotsByDate)
      .filter((dateStr) => dateStr >= from && dateStr <= to)
      .sort();
  }, [weekMonday, slotsByDate]);

  // Column heading day name, as the API words it in dateText ("Tue, ...").
  const dayNameByDate = useMemo(() => {
    const map: Record<string, string> = {};
    parsedSlots.forEach((slot) => {
      if (!map[slot.dateStr]) map[slot.dateStr] = slot.dayName;
    });
    return map;
  }, [parsedSlots]);

  const maxWeeks = MAX_WEEKS_AHEAD;

  const todayStr = moment().format('YYYY-MM-DD');

  // Today's row and the week view both show every available time for the
  // day; the buttons wrap and the step scrolls.
  const todayTimes = useMemo(
    () => slotsByDate[todayStr] || [],
    [slotsByDate, todayStr]
  );

  const weekTimesByDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    weekDates.forEach((dateStr) => {
      map[dateStr] = slotsByDate[dateStr] || [];
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

  const summaryItems = [
    location?.name,
    currentData?.reasonForVisit?.appReason,
    selectedAppointmentType?.text &&
      `${selectedAppointmentType.text}${
        selectedAppointmentType.slotDuration
          ? ` (${selectedAppointmentType.slotDuration} minutes)`
          : ''
      }`,
    provider?.providerFullName
  ].filter((item): item is string => !!item);

  const formatDate = (dateStr: string) => moment(dateStr).format('D');
  const formatDayOfWeek = (dateStr: string) =>
    (dayNameByDate[dateStr] || moment(dateStr).format('ddd')).toUpperCase();

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
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        Choose Date & Time
      </Typography>

      {/* Bug 432970: everything chosen so far on one line, in the order
          Location | Reason for Visit | Appointment Type (Duration) | Provider.
          Wraps between items (never mid-item) on narrow screens. */}
      {summaryItems.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            columnGap: 1,
            rowGap: 0.5,
            mb: 1,
            color: 'text.secondary'
          }}
        >
          {summaryItems.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <Typography variant="body2" aria-hidden>
                  |
                </Typography>
              )}
              <Typography variant="body2" sx={{ minWidth: 0 }}>
                {item}
              </Typography>
            </React.Fragment>
          ))}
        </Box>
      )}

      {providerScheduleInfoError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {providerScheduleInfoError}
        </Alert>
      )}

      {showFullSchedule && provider && (
        <Box
          onClick={() => {
            // The compact view shows today, so go back to this week's slots.
            setShowFullSchedule(false);
            setCurrentWeekStart(0);
          }}
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
                label={(weekDates[0] ? moment(weekDates[0]) : weekMonday).format(
                  'MMMM YYYY'
                )}
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
          {weekDates.length === 0 && (
            <Typography variant="body2" color="warning.main" fontWeight={600}>
              No available times this week
            </Typography>
          )}
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
