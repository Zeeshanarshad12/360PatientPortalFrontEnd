import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  ButtonGroup
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ViewListIcon from '@mui/icons-material/ViewList';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { widgetContent } from '@/components/Dashboard/contexts/widgetData';
import { useDispatch, useSelector } from '@/store/index';
import { getpatientvitals } from '@/slices/patientprofileslice';
import CircularProgressLoader from '@/components/ProgressLoaders/components/Circular';
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import { isNull } from '@/utils/functions';

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const MyVitals: React.FC<Props> = ({ dragHandleProps }) => {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [selectedVital, setSelectedVital] = useState('BP');
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { patientId, practiceId } = useCurrentPatient();
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [dates, setDates] = useState<string[]>([]);
  const [vitals, setVitals] = useState<{ name: string; values: string[] }[]>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isNull(patientId) && !isNull(practiceId)) {
          const Obj = { PatientId: patientId, PracticeId: practiceId };
          const response = await dispatch(getpatientvitals(Obj)).unwrap();
          const data = response.result;

          // Build Dates
          const extractedDates = data.map((d) => {
            const dateObj = new Date(d.sessionDate);
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            return `${month}/${day}`;
          });
          setDates(extractedDates);

          // Define which vitals you want to show
          const allowedVitals = [
            'Blood Pressure',
            'BMI Percentile',
            'Body Weight',
            'Body Height',
            'Heart Rate',
            'Pain Level',
            'Temperature'
          ];

          const vitalNameMapping = {
            'Blood Pressure': 'BP',
            'BMI Percentile': 'BMI',
            'Body Weight': 'Weight (lbs)',
            'Body Height': 'Height (ft-in)',
            'Heart Rate': 'Heart Rate (bpm)',
            'Pain Level': 'Pain Scale',
            Temperature: 'Temp (°F)'
          };

          const findByVstName = (list, vstName) =>
            list?.find(
              (item) => item.vstName?.toLowerCase() === vstName.toLowerCase()
            );

          // Helper: compute the display value for a given vital model
          const computeValue = (originalName, vitalModel) => {
            if (!vitalModel) return '-';
            const list = vitalModel.listOfPatientVitals;

            if (originalName.toLowerCase() === 'blood pressure') {
              const systolic = findByVstName(list, 'Systolic')?.value ?? '-';
              const diastolic = findByVstName(list, 'Diastolic')?.value ?? '-';
              return `${systolic}/${diastolic}`;
            }

            if (originalName.toLowerCase() === 'body height') {
              const feet = findByVstName(list, 'Feet')?.value ?? '-';
              const inches = findByVstName(list, 'Inches')?.value ?? '-';
              return `${feet}'${inches}"`;
            }

            if (originalName.toLowerCase() === 'pain level') {
              const painScale = list?.[0]?.value ?? '0';
              const painUnit = list?.[0]?.painScale;
              return painUnit ? `${painScale} - ${painUnit}` : `${painScale}`;
            }

            return list?.[0]?.value !== undefined ? `${list[0].value}` : '-';
          };

          const vitalsMap: Record<string, string[]> = {};
          allowedVitals.forEach((originalName) => {
            const displayName = vitalNameMapping[originalName] || originalName;
            vitalsMap[displayName] = new Array(data.length).fill('-');
          });

          data.forEach((day, dayIndex) => {
            allowedVitals.forEach((originalName) => {
              const displayName =
                vitalNameMapping[originalName] || originalName;
              const vitalModel = day.patientVitalViewModels.find(
                (v) => v.vitalName === originalName
              );
              vitalsMap[displayName][dayIndex] = computeValue(
                originalName,
                vitalModel
              );
            });
          });

          // Convert vitalsMap to array, preserving allowedVitals order
          const vitalsArray = allowedVitals
            .map((name) => vitalNameMapping[name] || name)
            .filter((name) => vitalsMap[name])
            .map((name) => ({
              name,
              values: vitalsMap[name]
            }));

          setVitals(vitalsArray);
        }
      } catch (error) {
        console.error('Error fetching vitals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, practiceId, patientId]);

  const renderTableView = () => (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: 'none',
        bgcolor: 'transparent',
        maxHeight: 350,
        overflowY: 'auto'
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                borderBottom: '1px solid #e0e0e0',
                color: 'text.secondary',
                fontWeight: 'bold',
                pb: 1,
                bgcolor: 'background.paper'
              }}
            >
              Vitals
            </TableCell>
            {dates.map((date, index) => (
              <TableCell
                key={index}
                align="center"
                sx={{
                  borderBottom: '1px solid #e0e0e0',
                  color: 'text.secondary',
                  fontWeight: 'bold',
                  pb: 1,
                  bgcolor: 'background.paper'
                }}
              >
                {date}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {vitals.map((vital, index) => (
            <TableRow key={index}>
              <TableCell
                sx={{
                  borderBottom: '1px solid #e0e0e0',
                  color: 'text.primary',
                  fontWeight: 'medium',
                  py: 1
                }}
              >
                {vital.name}
              </TableCell>
              {vital.values.map((value, valueIndex) => (
                <TableCell
                  key={valueIndex}
                  align="center"
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    color: 'text.primary',
                    py: 1
                  }}
                >
                  {value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Chart data comes directly from vitals state & dates state
  const getChartData = () => {
    const vital = vitals.find((v) => v.name === selectedVital);
    if (!vital) return { series: [], categories: [] };

    const numericValues = vital.values.map((value) => {
      if (value === '-') return null;

      if (selectedVital.includes('Height (ft-in)')) {
        // Example value: 5'4"
        const match = value.match(/(\d+)'(\d+)?/); // feet and inches
        if (match) {
          const feet = parseInt(match[1]) || 0;
          const inches = parseInt(match[2]) || 0;
          const decimalFeet = feet + inches / 12;
          return Math.round(decimalFeet * 10) / 10;
        }
        return null;
      }

      const parsed = parseFloat(value);
      return Number.isNaN(parsed) ? null : parsed;
    });

    const originalValues = vital.values;

    return {
      series: [
        {
          name: vital.name,
          data: numericValues
        }
      ],
      categories: dates,
      originalValues
    };
  };

  const getChartOptions = (): any => {
    const chartData = getChartData();

    const colorMap: Record<string, string> = {
      'Blood Pressure': '#2196F3',
      'BMI Percentile': '#4CAF50',
      'Body Weight': '#FF9800',
      'Body Height': '#9C27B0',
      'Heart Rate': '#F44336',
      Temperature: '#00BCD4',
      'Pain Level': '#795548'
    };

    return {
      chart: {
        type: 'line',
        height: 200,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      series: chartData.series,
      xaxis: {
        categories: chartData.categories,
        labels: { style: { colors: '#666', fontSize: '12px' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: { colors: '#666', fontSize: '12px' }
        }
      },
      colors: [colorMap[selectedVital] || '#2196F3'],
      stroke: { curve: 'smooth', width: 3, connectNulls: true },
      markers: {
        size: 6,
        colors: [colorMap[selectedVital] || '#2196F3'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: { size: 8 }
      },
      grid: {
        borderColor: '#e0e0e0',
        strokeDashArray: 3,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: (value, { dataPointIndex }) => {
            if (value === null || value === undefined) return 'No data';
            if (selectedVital.toLowerCase().includes('bp')) {
              const fullValue =
                chartData.originalValues[dataPointIndex] || '0/0';
              return `${fullValue} mmHg`;
            }
            if (selectedVital.toLowerCase().includes('temperature'))
              return `${value}°F`;
            if (selectedVital.toLowerCase().includes('weight'))
              return `${value} lbs`;
            if (selectedVital.toLowerCase().includes('height')) {
              const fullValue =
                chartData.originalValues[dataPointIndex] || '0.0';
              return `${fullValue} ft`;
            }
            if (selectedVital.toLowerCase().includes('heart rate'))
              return `${value} bpm`;
            return value;
          }
        }
      },

      dataLabels: { enabled: false }
    };
  };

  const renderChartView = () => {
    if (!isClient) {
      return (
        <Box
          sx={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Loading chart...
          </Typography>
        </Box>
      );
    }

    const chartData = getChartData();

    // Dynamic import for ReactApexChart
    const ReactApexChart = require('react-apexcharts').default;

    return (
      <Box sx={{ height: 200, width: '100%' }}>
        <ReactApexChart
          options={getChartOptions()}
          series={chartData.series}
          type="line"
          height={200}
        />
      </Box>
    );
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
                {widgetContent.myVitals.title}
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
            {/* Header with View Toggle */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="h4" fontWeight="bold">
                {widgetContent.myVitals.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {/* View Toggle Buttons */}
                <ButtonGroup size="small" sx={{ mr: 1 }}>
                  <Button
                    variant={viewMode === 'table' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('table')}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      borderRadius: '10px',
                      bgcolor:
                        viewMode === 'table' ? 'primary.main' : 'transparent',
                      color: viewMode === 'table' ? 'white' : 'text.secondary',
                      '&:hover': {
                        bgcolor:
                          viewMode === 'table' ? 'primary.dark' : 'action.hover'
                      }
                    }}
                  >
                    <ViewListIcon sx={{ fontSize: 20 }} />
                  </Button>
                  <Button
                    variant={viewMode === 'chart' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('chart')}
                    sx={{
                      minWidth: 'auto',
                      px: 1,
                      borderRadius: '10px',
                      bgcolor:
                        viewMode === 'chart' ? 'primary.main' : 'transparent',
                      color: viewMode === 'chart' ? 'white' : 'text.secondary',
                      '&:hover': {
                        bgcolor:
                          viewMode === 'chart' ? 'primary.dark' : 'action.hover'
                      }
                    }}
                  >
                    <ShowChartIcon sx={{ fontSize: 20 }} />
                  </Button>
                </ButtonGroup>

                {/* Drag Handle */}
                <Box {...dragHandleProps}>
                  <IconButton size="small" sx={{ cursor: 'grab' }}>
                    <DragIndicatorIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Vital Selection for Chart View */}
            {viewMode === 'chart' && (
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                {vitals.map((vital) => (
                  <Button
                    key={vital.name}
                    variant={
                      selectedVital === vital.name ? 'contained' : 'outlined'
                    }
                    size="small"
                    onClick={() => setSelectedVital(vital.name)}
                    sx={{
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 1.5,
                      minWidth: 'auto',
                      bgcolor:
                        selectedVital === vital.name
                          ? 'primary.main'
                          : 'transparent',
                      color:
                        selectedVital === vital.name
                          ? 'white'
                          : 'text.secondary',
                      '&:hover': {
                        bgcolor:
                          selectedVital === vital.name
                            ? 'primary.dark'
                            : 'action.hover'
                      }
                    }}
                  >
                    {vital.name}
                  </Button>
                ))}
              </Box>
            )}

            {/* Content Area */}
            <Box
              sx={{
                maxHeight: viewMode === 'table' ? 'none' : 350,
                overflowY: viewMode === 'table' ? 'visible' : 'auto',
                pr: 1,
                minHeight: viewMode === 'chart' ? 200 : 'auto'
              }}
            >
              {viewMode === 'table' ? renderTableView() : renderChartView()}
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default MyVitals;
