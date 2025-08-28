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
import { widgetContent } from '@/components/Dashboard/contexts/widgetData';
import { useDispatch, useSelector } from '@/store/index';
import { useState, useEffect, useMemo } from 'react';
import { GetPatientAllergies } from '@/slices/patientprofileslice';
import CircularProgressLoader from '@/components/ProgressLoaders/components/Circular';

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const Allergies: React.FC<Props> = ({ dragHandleProps }) => {
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const Obj = {
          PatientId: localStorage.getItem('patientID')
        };

        const response = await dispatch(GetPatientAllergies(Obj)).unwrap();
        const data = response.result;
        setAllergies(data);
      } catch (error) {
        console.error('Error fetching allergies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return {
          bgcolor: '#ffebee',
          textColor: '#d32f2f',
          chipColor: '#d32f2f'
        };
      case 'mild':
        return {
          bgcolor: '#fff3e0',
          textColor: '#f57c00',
          chipColor: '#f57c00'
        };
      case 'moderate':
        return {
          bgcolor: '#e8f5e8',
          textColor: '#2e7d32',
          chipColor: '#2e7d32'
        };
      default:
        return {
          bgcolor: '#f5f5f5',
          textColor: '#666',
          chipColor: '#666'
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
                {widgetContent.allergies.title}
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
                {widgetContent.allergies.title}
                <Chip
                  label={allergies.length}
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

            {/* Scrollable Allergies List */}
            <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1 }}>
              {allergies.map((allergy: any, index: number) => {
                const colors = getSeverityColor(allergy.severity);
                return (
                  <Box
                    key={index}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      p: 2,
                      mb: 1,
                      position: 'relative',
                      bgcolor: colors.bgcolor
                    }}
                  >
                    {/* Allergy Details */}
                    <Typography
                      color="text.primary"
                      fontWeight="bold"
                      sx={{
                        color: colors.textColor,
                        mb: 1,
                        textTransform: 'capitalize'
                      }}
                    >
                      {allergy.description}

                      {/* Severity Badge */}
                      <Chip
                        label={allergy.severity}
                        size="small"
                        sx={{
                          position: 'absolute',
                          right: 15,
                          fontSize: '0.75rem',
                          borderRadius: '15px',
                          bgcolor: colors.chipColor,
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ mb: 0.5 }}
                    >
                      Onset: {new Date(allergy.onsetDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      Category: {allergy.categoryName}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* See All Link */}
            {/* <Box textAlign="center" mt={2}>
              <Link
                href="#"
                underline="hover"
                color="primary"
                fontSize="0.9rem"
                fontWeight="bold"
              >
                See all Allergies
              </Link>
            </Box> */}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Allergies;