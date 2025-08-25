import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Link,
  Button
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { widgetContent } from '@/components/Dashboard/contexts/widgetData';
import { useDispatch, useSelector } from '@/store/index';
import { useState, useEffect, useMemo } from 'react';
import { GetPatientEncounterDetails } from '@/slices/patientprofileslice';
import moment from 'moment-timezone';
import CircularProgressLoader from '@/components/ProgressLoaders/components/Circular';

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const MyMedicalTimeline: React.FC<Props> = ({ dragHandleProps }) => {
  const dispatch = useDispatch();
  const [timelineEvents, settimelineEvents] = useState([]);
  const [fromDate, setFromDate] = useState(moment().format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(moment().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const Obj = {
          PatientId: localStorage.getItem('patientID'),
          dateflag: false,
          datefrom: fromDate,
          dateto: toDate
        };
        const response = await dispatch(
          GetPatientEncounterDetails(Obj)
        ).unwrap();
        const data = response;
        settimelineEvents(data);
      } catch (error) {
        console.error('Error fetching medications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'discharged':
        return {
          bgcolor: '#2e7d32',
          textColor: 'white'
        };
      case 'pending':
        return {
          bgcolor: '#f57c00',
          textColor: 'white'
        };
      case 'cancelled':
        return {
          bgcolor: '#d32f2f',
          textColor: 'white'
        };
      default:
        return {
          bgcolor: '#666',
          textColor: 'white'
        };
    }
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
              mb={2}
            >
              <Typography variant="h4" fontWeight="bold">
                {widgetContent.myMedicalTimeline.title}
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
            {/* Header with Count */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h4" fontWeight="bold">
                {widgetContent.myMedicalTimeline.title}
                <Chip
                  label={timelineEvents.length}
                  color="default"
                  size="small"
                  sx={{
                    fontWeight: 'bold',
                    bgcolor: 'black',
                    color: 'white',
                    ml: 2
                  }}
                />
              </Typography>
              <Box {...dragHandleProps}>
                <IconButton size="small" sx={{ cursor: 'grab' }}>
                  <DragIndicatorIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Scrollable Timeline Events List */}
            <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1 }}>
              {timelineEvents.map((event: any, index: number) => {
                const statusColors = getStatusColor('completed');
                return (
                  <Box
                    key={index}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      p: 2,
                      mb: 1,
                      position: 'relative',
                      bgcolor: '#fafafa'
                    }}
                  >
                    {/* Event Title and Provider */}
                    <Typography fontWeight="bold" sx={{ mb: 1, pr: 8 }}>
                      {event.title}

                      {/* Status Badge */}
                      <Chip
                        label={'Completed'}
                        size="small"
                        sx={{
                          position: 'absolute',
                          right: 15,
                          fontSize: '0.75rem',
                          borderRadius: '15px',
                          bgcolor: statusColors.bgcolor,
                          color: statusColors.textColor,
                          fontWeight: 'bold'
                        }}
                      />
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ mb: 1 }}
                    >
                      {event.provider}
                    </Typography>

                    {/* Date and Time */}
                    <Box display="flex" alignItems="center" sx={{ mb: 0.5 }}>
                      <CalendarTodayIcon
                        sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mr: 1 }}
                      >
                        {new Date(event.encounterDateTime).toLocaleDateString()}
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
                        {new Date(event.encounterDateTime).toLocaleTimeString()}
                      </Typography>
                    </Box>

                    {/* Location */}
                    <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                      <LocationOnIcon
                        sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {event.locationName}
                      </Typography>
                    </Box>

                    {/* Description */}
                    {/* {event.description && ( */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {event.reasonString}
                    </Typography>
                    {/* )} */}

                    {/* Associated Details Buttons */}
                    {event.associatedDetails && (
                      <Box display="flex" gap={1} sx={{ mb: 1 }}>
                        {event.associatedDetails.map(
                          (detail: string, detailIndex: number) => (
                            <Button
                              key={detailIndex}
                              variant="outlined"
                              size="small"
                              sx={{
                                borderRadius: '20px',
                                borderColor: '#e0e0e0',
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                                py: 0.5,
                                px: 1.5,
                                minWidth: 'auto'
                              }}
                            >
                              {detail}
                            </Button>
                          )
                        )}
                      </Box>
                    )}

                    {/* View Clinical Details Link */}
                    <Link
                      href="#"
                      underline="hover"
                      color="primary"
                      fontSize="0.8rem"
                      fontWeight="bold"
                    >
                      View Clinical Details
                    </Link>
                  </Box>
                );
              })}
            </Box>

            {/* See All Link */}
            <Box textAlign="center" mt={2}>
              <Link
                href="#"
                underline="hover"
                color="primary"
                fontSize="0.9rem"
                fontWeight="bold"
              >
                See all Medical History
              </Link>
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default MyMedicalTimeline;