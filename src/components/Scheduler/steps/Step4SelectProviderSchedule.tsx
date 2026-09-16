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

const minutesToTime = (minutes: number) =>
  moment().startOf('day').add(minutes, 'minutes').format('hh:mm A');

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
          locationId: location.id,
          PracticeId: practiceId
        }) as any
      );
    }
  }, [providerId, location?.id, dispatch]);

  const scheduleByDay = useMemo(() => {
    const items = providerScheduleInfo?.providerLocationSchedulerItems || [];
    const map: Record<number, any> = {};
    items.forEach((item: any) => {
      map[item.dayOfWeek] = item;
    });
    return map;
  }, [providerScheduleInfo]);

  const holidayDates = useMemo(() => {
    const holidays = providerScheduleInfo?.providerHolidays || [];
    return new Set(
      holidays.map((holiday: any) => moment(holiday.offDate).format('YYYY-MM-DD'))
    );
  }, [providerScheduleInfo]);

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

  // A slot must only be offered when the *selected appointment
  // type's full duration* fits before close and doesn't run into a break —
  // not just the practice's base grid interval. Candidate start times still
  // step by the schedule's configured grid size (appointmentSlotSizeInMinutes),
  // but each candidate is validated against the real appointment duration.
  // NOTE: this still can't detect a conflict with another patient's already
  // booked appointment — the schedule info this screen receives only
  // contains working hours/breaks/holidays, not existing bookings, so a
  // slot that overlaps another appointment can still be shown here. See the
  // backend fix needed for double-booking prevention.
  const getTimesForDate = (dateStr: string) => {
    if (!dateStr || holidayDates.has(dateStr)) return [];
    const item = scheduleByDay[moment(dateStr).isoWeekday()];
    if (!item || item.workTimeStartMinute == null || item.workTimeEndMinute == null) {
      return [];
    }
    const gridSize = item.appointmentSlotSizeInMinutes || 30;
    const duration =
      selectedAppointmentType?.slotDuration || item.appointmentSlotSizeInMinutes || 30;
    const times: string[] = [];
    for (
      let minute = item.workTimeStartMinute;
      minute + duration <= item.workTimeEndMinute;
      minute += gridSize
    ) {
      const overlapsBreak =
        item.breakTimeStartMinute != null &&
        item.breakTimeEndMinute != null &&
        minute < item.breakTimeEndMinute &&
        minute + duration > item.breakTimeStartMinute;
      if (!overlapsBreak) {
        times.push(minutesToTime(minute));
      }
    }
    return times;
  };

  const todayStr = moment().format('YYYY-MM-DD');

  const todayTimes = useMemo(
    () => getTimesForDate(todayStr).slice(0, SLOTS_PER_DAY),
    [todayStr, scheduleByDay, holidayDates, selectedAppointmentType]
  );

  const weekTimesByDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    weekDates.forEach((dateStr) => {
      map[dateStr] = getTimesForDate(dateStr).slice(0, SLOTS_PER_DAY);
    });
    return map;
  }, [weekDates, scheduleByDay, holidayDates, selectedAppointmentType]);

  const handleSelectSlot = (dateStr: string, time: string) => {
    setSelectedDate(dateStr);
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please complete all fields');
      return;
    }
    const scheduleItem = scheduleByDay[moment(selectedDate).isoWeekday()];
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
              <>
                {todayTimes.map((time) => (
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
                ))}
                {/* Only offer "More" when today actually has
                    times to expand from. */}
                <Button variant="text" onClick={() => setShowFullSchedule(true)}>
                  More
                </Button>
              </>
            ) : (
              // No-availability message needs distinct styling
              // from the "Next available..." label above it.
              <Typography variant="body2" color="warning.main" fontWeight={600}>
                No available times today
              </Typography>
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

          <Grid container spacing={1}>
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
      )}
    </StepLayout>
  );
};

export default Step4SelectProviderSchedule;
