import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Link
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

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const getStatusColor = (appointmentStatus: string) => {
  switch (appointmentStatus.toLowerCase()) {
    case 'scheduled':
      return { bgcolor: '#fff3e0', textColor: '#f57c00' };
    case 'completed':
      return { bgcolor: '#2e7d32', textColor: 'white' };
    default:
      return { bgcolor: '#e0e0e0', textColor: '#666' };
  }
};

const UpcomingAppointments: React.FC<Props> = ({ dragHandleProps }) => {
  const dispatch = useDispatch();
  const [appointments, setappointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const Obj = {
          PatientId: localStorage.getItem('patientID')
        };

        const response = await dispatch(getpatientappointments(Obj)).unwrap();
        const data = response.result;
        setappointments(data);
      } catch (error) {
        console.error('Error fetching medications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <>
      {loading ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ pb: 1 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h4" fontWeight="bold">
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
              mb={2}
            >
              <Typography variant="h4" fontWeight="bold">
                {widgetContent.upcomingAppointments.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {/* <Link
                  href="#"
                  underline="hover"
                  color="primary"
                  fontSize="0.95rem"
                  fontWeight="bold"
                  sx={{ mr: 1 }}
                >
                  Schedule Appointment
                </Link> */}
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
                      {appt.providerName}
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
                  </Box>
                );
              })}
            </Box>

            {/* View All Link */}
            {/* <Box textAlign="center" mt={2}>
              <Link
                href="#"
                underline="hover"
                color="primary"
                fontSize="0.95rem"
                fontWeight="bold"
              >
                View all Appointments
              </Link>
            </Box> */}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default UpcomingAppointments;