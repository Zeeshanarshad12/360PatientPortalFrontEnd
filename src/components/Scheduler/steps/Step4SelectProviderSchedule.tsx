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

const SLOTS_PER_DAY = 5;
// Bug 432588 (Issue 2): the old code only ever generated 14 days of dates
// total, which blocked "Next" after ~2 weeks out. There's no real
// business/product rule in this codebase for a max advance-booking window,
// so this is a generous stand-in (~1 year) rather than a verified limit —
// confirm with backend/product whether an actual cap should replace it.
const MAX_WEEKS_AHEAD = 52;

interface AvailableSlot {
  dateStr: string; // YYYY-MM-DD, clinic wall-clock date of the slot
  dayName: string; // e.g. "Tue", from the API's dateText
  time: string; // hh:mm A, clinic wall-clock start time
  startIso: string; // exact start instant as sent by the API
  startMs: number;
  endMs: number;
  utcOffset: number; // clinic's UTC offset in minutes (e.g. 300 = +05:00)
}

// Time zones: the clinic's schedule is what matters, not the patient's
// browser. Each slot has two views of the same time:
// - startDate/endDate: the exact instant, but written in the *server's*
//   zone (e.g. "2026-10-12T22:30:00-05:00"), so its date/hour aren't the
//   clinic's.
// - strStartDate/strEndDate (+ startTime, dateText): the clinic's own wall
//   clock, no offset (e.g. "2026-10-13T08:30:00" = Tue 08:30 AM).
// Display and day grouping use the clinic wall clock; the instant is only
// used for "already past?" checks and for booking. Their difference is the
// clinic's UTC offset.
const toAvailableSlot = (slot: any): AvailableSlot | null => {
  const startInstant = moment.parseZone(slot?.startDate);
  const endInstant = moment.parseZone(slot?.endDate);
  if (
    !startInstant.isValid() ||
    !endInstant.isValid() ||
    !endInstant.isAfter(startInstant)
  ) {
    return null;
  }
  // Read the offset-free wall clock as if it were UTC to compare with the
  // instant; falls back to startDate's own wall clock for older responses.
  const wallStart = slot?.strStartDate
    ? moment.utc(slot.strStartDate, moment.ISO_8601)
    : null;
  const hasWallClock = !!wallStart && wallStart.isValid();
  const clinicStart = hasWallClock ? (wallStart as moment.Moment) : startInstant;
  const dateStr = clinicStart.format('YYYY-MM-DD');
  return {
    dateStr,
    dayName:
      (typeof slot?.dateText === 'string' && slot.dateText.split(',')[0].trim()) ||
      clinicStart.format('ddd'),
    time: slot?.startTime || clinicStart.format('hh:mm A'),
    startIso: slot.startDate,
    startMs: startInstant.valueOf(),
    endMs: endInstant.valueOf(),
    utcOffset: hasWallClock
      ? Math.round(((wallStart as moment.Moment).valueOf() - startInstant.valueOf()) / 60000)
      : startInstant.utcOffset()
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

  // The clinic's UTC offset, learned from the slots the API returns. Until
  // the first response arrives, the browser's own offset is the best guess.
  const [clinicUtcOffset, setClinicUtcOffset] = useState<number | null>(null);
  const browserUtcOffset = moment().utcOffset();
  const rangeUtcOffset = clinicUtcOffset ?? browserUtcOffset;

  // "Now" on the clinic's clock: decides which day is "today" and where the
  // clinic's Monday-Sunday week starts and ends.
  const clinicNow = () => moment().utcOffset(rangeUtcOffset);

  // Slots are fetched one week at a time: Monday 12:00 AM through Sunday
  // 11:59:59 PM of the week shown, on the clinic's clock. Opening the step
  // loads the current week; the < / > arrows (currentWeekStart) load the
  // previous/next week. If the first response reveals the clinic is in a
  // different zone than the browser, the week is refetched once with the
  // clinic's boundaries.
  useEffect(() => {
    if (providerId && location?.id) {
      const weekStart = clinicNow()
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
          // Clinic wall-clock time with its UTC offset, e.g.
          // 2026-10-12T00:00:00.000+05:00, so "Monday 12 AM" stays Monday.
          fromDate: weekStart.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
          toDate: weekEnd.format('YYYY-MM-DDTHH:mm:ss.SSSZ')
        }) as any
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    providerId,
    location?.id,
    practiceId,
    appointmentDurationMinutes,
    currentWeekStart,
    rangeUtcOffset,
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

  // Remember the clinic's offset (also follows DST changes week to week).
  useEffect(() => {
    if (parsedSlots.length && parsedSlots[0].utcOffset !== clinicUtcOffset) {
      setClinicUtcOffset(parsedSlots[0].utcOffset);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedSlots]);

  // "date time" -> exact slot start (with offset), handed to booking so the
  // appointment is saved at the clinic's time, not the browser's.
  const slotStartByKey = useMemo(() => {
    const map: Record<string, string> = {};
    parsedSlots.forEach((slot) => {
      map[`${slot.dateStr} ${slot.time}`] = slot.startIso;
    });
    return map;
  }, [parsedSlots]);

  const slotsByDate = useMemo(() => {
    const slots = parsedSlots;

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
  }, [parsedSlots, selectedAppointmentType]);

  const hasAnyAvailableSlot = Object.keys(slotsByDate).length > 0;

  // Bug 432588 (Issue 1): weeks follow a real Monday-Sunday boundary (on the
  // clinic's clock). Only days that actually have bookable times are shown
  // as columns — e.g. if the provider isn't available Monday, the week
  // starts at Tuesday.
  const weekMonday = useMemo(
    () => clinicNow().add(currentWeekStart, 'weeks').startOf('isoWeek'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentWeekStart, rangeUtcOffset]
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

  const todayStr = clinicNow().format('YYYY-MM-DD');

  const todayTimes = useMemo(
    () => (slotsByDate[todayStr] || []).slice(0, SLOTS_PER_DAY),
    [slotsByDate, todayStr]
  );

  const weekTimesByDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    weekDates.forEach((dateStr) => {
      // Week view shows every bookable time for the day (the step scrolls);
      // only the compact "today" row is capped at SLOTS_PER_DAY.
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
      // Exact start with the clinic's offset; undefined if the chosen time
      // didn't come from the loaded slots (Step 5 then falls back).
      startDateTime: slotStartByKey[`${selectedDate} ${selectedTime}`],
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
