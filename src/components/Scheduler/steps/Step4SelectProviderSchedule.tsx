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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useDispatch, useSelector } from '@/store/index';
import {
  GetProviderLocationScheduleInfo,
  GetAllAppointmentType
} from '@/slices/ScheduleSlice';
import { AppointmentData, AppointmentTypeOption } from '../types';
import moment from 'moment';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';

interface Step4Props {
  onNext: (data: AppointmentData) => void;
  onBack: () => void;
  currentData?: AppointmentData;
}

const DAYS_TO_SHOW = 14;
const DAYS_PER_PAGE = 5;
const SLOTS_PER_DAY = 5;

const normalizeText = (value?: string) =>
  (value || '').trim().replace(/\s+/g, ' ').toLowerCase();

const PENDING_TYPE_VALUE = '__pending_appointment_type__';

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
  const [selectedAppointmentType, setSelectedAppointmentType] =
    useState<AppointmentTypeOption | null>(currentData?.appointmentType || null);

  const {
    selectedLocation,
    providerScheduleInfo,
    providerScheduleInfoLoading,
    providerScheduleInfoError,
    appointmentTypes,
    appointmentTypesLoading,
    appointmentTypesError
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

  useEffect(() => {
    dispatch(GetAllAppointmentType({ PracticeId: practiceId }) as any);
  }, [practiceId, dispatch]);

  useEffect(() => {
    if (!selectedAppointmentType || !appointmentTypes?.length) return;
    const targetText = normalizeText(selectedAppointmentType.text);
    const match = appointmentTypes.find((type: AppointmentTypeOption) =>
      selectedAppointmentType.id
        ? type.id === selectedAppointmentType.id
        : normalizeText(type.text) === targetText
    );
    if (match && match !== selectedAppointmentType) {
      setSelectedAppointmentType(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentTypes]);

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

  const uniqueDates = useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      dates.push(moment().add(i, 'days').format('YYYY-MM-DD'));
    }
    return dates;
  }, []);

  const weekDates = useMemo(() => {
    const startIndex = currentWeekStart * DAYS_PER_PAGE;
    return uniqueDates.slice(startIndex, startIndex + DAYS_PER_PAGE);
  }, [uniqueDates, currentWeekStart]);

  const maxWeeks = Math.ceil(uniqueDates.length / DAYS_PER_PAGE);

  const getTimesForDate = (dateStr: string) => {
    if (!dateStr || holidayDates.has(dateStr)) return [];
    const item = scheduleByDay[moment(dateStr).isoWeekday()];
    if (!item || item.workTimeStartMinute == null || item.workTimeEndMinute == null) {
      return [];
    }
    const slotSize = item.appointmentSlotSizeInMinutes || 30;
    const times: string[] = [];
    for (
      let minute = item.workTimeStartMinute;
      minute + slotSize <= item.workTimeEndMinute;
      minute += slotSize
    ) {
      const inBreak =
        item.breakTimeStartMinute != null &&
        item.breakTimeEndMinute != null &&
        minute >= item.breakTimeStartMinute &&
        minute < item.breakTimeEndMinute;
      if (!inBreak) {
        times.push(minutesToTime(minute));
      }
    }
    return times;
  };

  const todayStr = moment().format('YYYY-MM-DD');

  const todayTimes = useMemo(
    () => getTimesForDate(todayStr).slice(0, SLOTS_PER_DAY),
    [todayStr, scheduleByDay, holidayDates]
  );

  const weekTimesByDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    weekDates.forEach((dateStr) => {
      map[dateStr] = getTimesForDate(dateStr).slice(0, SLOTS_PER_DAY);
    });
    return map;
  }, [weekDates, scheduleByDay, holidayDates]);

  const handleSelectSlot = (dateStr: string, time: string) => {
    setSelectedDate(dateStr);
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (!selectedAppointmentType) {
      alert('Please select an appointment type');
      return;
    }
    if (!selectedDate || !selectedTime) {
      alert('Please complete all fields');
      return;
    }
    const scheduleItem = scheduleByDay[moment(selectedDate).isoWeekday()];
    onNext({
      ...currentData,
      facility: location,
      appointmentType: selectedAppointmentType,
      date: selectedDate,
      time: selectedTime,
      slotDurationMinutes:
        selectedAppointmentType.slotDuration ??
        scheduleItem?.appointmentSlotSizeInMinutes
    });
  };

  const formatDate = (dateStr: string) => moment(dateStr).format('D');
  const formatDayOfWeek = (dateStr: string) =>
    moment(dateStr).format('ddd').toUpperCase();

  return (
    <Box sx={{ width: '100%' }}>
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

      {/* Appointment Type */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
          Appointment Type
        </Typography>
        {appointmentTypesError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {appointmentTypesError}
          </Alert>
        )}
        <FormControl fullWidth disabled={appointmentTypesLoading}>
          <InputLabel>Appointment Type</InputLabel>
          <Select
            label="Appointment Type"
            value={
              selectedAppointmentType?.id ??
              (selectedAppointmentType ? PENDING_TYPE_VALUE : '')
            }
            onChange={(e) => {
              const match = (appointmentTypes || []).find(
                (type: AppointmentTypeOption) => type.id === e.target.value
              );
              setSelectedAppointmentType(match || null);
            }}
            endAdornment={
              appointmentTypesLoading ? (
                <CircularProgress size={18} sx={{ mr: 3 }} />
              ) : undefined
            }
          >
            {selectedAppointmentType && !selectedAppointmentType.id && (
              <MenuItem value={PENDING_TYPE_VALUE} disabled>
                {selectedAppointmentType.text}
              </MenuItem>
            )}
            {(appointmentTypes || []).map((type: AppointmentTypeOption) => (
              <MenuItem
                key={type.id}
                value={type.id}
                disabled={type.disableType}
              >
                {type.text}
                {type.slotDuration ? ` (${type.slotDuration}m)` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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
                {provider.providerSpeciality}
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
              <Typography variant="body2" color="text.secondary">
                No available times today
              </Typography>
            )}
            <Button
              variant="text"
              onClick={() => setShowFullSchedule(true)}
              sx={{ ml: todayTimes.length > 0 ? 0 : 'auto' }}
            >
              More
            </Button>
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

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          sx={{ ml: 'auto' }}
          disabled={!selectedAppointmentType || !selectedDate || !selectedTime}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default Step4SelectProviderSchedule;
