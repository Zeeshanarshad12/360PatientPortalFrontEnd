import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Stack,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Grid
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { AppointmentData } from '../types';
import { generateTimeSlots, dummyAppointmentTypes } from '../dummyData';
import moment from 'moment';

interface Step4Props {
  onNext: (data: AppointmentData) => void;
  onBack: () => void;
  currentData?: AppointmentData;
}

const Step4DateAndTime: React.FC<Step4Props> = ({
  onNext,
  onBack,
  currentData
}) => {
  const [visitType, setVisitType] = useState<'In-Person' | 'Video'>(
    currentData?.visitType || 'In-Person'
  );
  const [appointmentType, setAppointmentType] = useState(
    currentData?.appointmentType || ''
  );
  const [selectedDate, setSelectedDate] = useState(currentData?.date || '');
  const [selectedTime, setSelectedTime] = useState(currentData?.time || '');
  const [currentWeekStart, setCurrentWeekStart] = useState(0);

  const allSlots = useMemo(() => generateTimeSlots(), []);
  const uniqueDates = useMemo(() => {
    const dates = [...new Set(allSlots.map((s) => s.date))].sort();
    return dates;
  }, [allSlots]);

  const weekDates = useMemo(() => {
    const startIndex = currentWeekStart * 7;
    return uniqueDates.slice(startIndex, startIndex + 7);
  }, [uniqueDates, currentWeekStart]);

  const availableTimes = useMemo(() => {
    if (!selectedDate) return [];
    return allSlots
      .filter((s) => s.date === selectedDate && s.available)
      .map((s) => s.time);
  }, [selectedDate, allSlots]);

  const handleNext = () => {
    if (!selectedDate || !selectedTime || !appointmentType) {
      alert('Please complete all fields');
      return;
    }
    onNext({
      ...currentData,
      visitType,
      appointmentType,
      date: selectedDate,
      time: selectedTime
    });
  };

  const maxWeeks = Math.ceil(uniqueDates.length / 7);

  const formatDate = (dateStr: string) => {
    return moment(dateStr).format('D');
  };

  const formatDayOfWeek = (dateStr: string) => {
    return moment(dateStr).format('ddd').toUpperCase();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Choose Date & Time
      </Typography>

      {/* Visit Type Toggle */}
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        Visit Type
      </Typography>
      <ToggleButtonGroup
        value={visitType}
        exclusive
        onChange={(e, newVisitType) => {
          if (newVisitType) setVisitType(newVisitType);
        }}
        fullWidth
        sx={{ mb: 3 }}
      >
        <ToggleButton value="In-Person">In-Person</ToggleButton>
        <ToggleButton value="Video">Video</ToggleButton>
      </ToggleButtonGroup>

      {/* Appointment Type Dropdown */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Appointment Type</InputLabel>
        <Select
          value={appointmentType}
          label="Appointment Type"
          onChange={(e) => setAppointmentType(e.target.value)}
        >
          {dummyAppointmentTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Next available appointment this week at:
      </Typography>

      {/* Week Navigation and Calendar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2
        }}
      >
        <IconButton
          onClick={() => setCurrentWeekStart(Math.max(0, currentWeekStart - 1))}
          disabled={currentWeekStart === 0}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="body2">
          {moment(weekDates[0]).format('MMMM YYYY')}
        </Typography>
        <IconButton
          onClick={() =>
            setCurrentWeekStart(Math.min(maxWeeks - 1, currentWeekStart + 1))
          }
          disabled={currentWeekStart >= maxWeeks - 1}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Date Selection Grid */}
      <Grid container spacing={1} sx={{ mb: 3 }}>
        {weekDates.map((dateStr) => (
          <Grid item xs={12 / 7} key={dateStr}>
            <Paper
              onClick={() => setSelectedDate(dateStr)}
              sx={{
                p: 1.5,
                textAlign: 'center',
                cursor: 'pointer',
                border: '2px solid',
                borderColor:
                  selectedDate === dateStr ? 'primary.main' : '#e0e0e0',
                bgcolor:
                  selectedDate === dateStr ? 'primary.lighter' : 'white',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main'
                }
              }}
            >
              <Typography variant="caption" fontWeight="bold">
                {formatDayOfWeek(dateStr)}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {formatDate(dateStr)}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Time Selection Grid */}
      {selectedDate && (
        <Box>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
            Available Times:
          </Typography>
          <Grid container spacing={1} sx={{ mb: 3 }}>
            {availableTimes.length > 0 ? (
              availableTimes.map((time) => (
                <Grid item xs={6} sm={4} key={time}>
                  <Button
                    fullWidth
                    variant={selectedTime === time ? 'contained' : 'outlined'}
                    onClick={() => setSelectedTime(time)}
                    size="small"
                  >
                    {time}
                  </Button>
                </Grid>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No available times for this date
              </Typography>
            )}
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
          disabled={!selectedDate || !selectedTime || !appointmentType}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default Step4DateAndTime;
