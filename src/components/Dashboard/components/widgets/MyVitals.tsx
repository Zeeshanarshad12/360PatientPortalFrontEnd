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

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const MyVitals: React.FC<Props> = ({ dragHandleProps }) => {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [selectedVital, setSelectedVital] = useState('BP');
  const [isClient, setIsClient] = useState(false);
  const vitalsData = widgetContent.myVitals.data;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const renderTableView = () => (
    <TableContainer component={Paper} sx={{ boxShadow: 'none', bgcolor: 'transparent' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ 
              borderBottom: '1px solid #e0e0e0', 
              color: 'text.secondary', 
              fontWeight: 'bold', 
              pb: 1 
            }}>
              Vitals
            </TableCell>
            {vitalsData.dates.map((date, index) => (
              <TableCell 
                key={index} 
                align="center" 
                sx={{ 
                  borderBottom: '1px solid #e0e0e0', 
                  color: 'text.secondary', 
                  fontWeight: 'bold',
                  pb: 1
                }}
              >
                {date}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {vitalsData.vitals.map((vital, index) => (
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

  const getChartData = () => {
    const vital = vitalsData.vitals.find(v => v.name === selectedVital);
    if (!vital) return { series: [], categories: [] };

    // Convert string values to numbers for charting
    const numericValues = vital.values.map(value => {
      if (vital.name === 'BP') {
        // For BP, take the systolic value (first number before '/')
        return parseInt(value.split('/')[0]);
      } else if (vital.name === 'Temp') {
        // For temperature, convert to number
        return parseFloat(value);
      } else {
        // For others, convert to number
        return parseFloat(value);
      }
    });

    return {
      series: [{
        name: vital.fullName,
        data: numericValues
      }],
      categories: vitalsData.dates
    };
  };

  const getChartOptions = (): any => {
    const vital = vitalsData.vitals.find(v => v.name === selectedVital);
    const chartData = getChartData();

    // Define colors for different vitals
    const getVitalColor = () => {
      switch (selectedVital) {
        case 'BP': return '#2196F3'; // Blue for BP
        case 'BMI': return '#4CAF50'; // Green for BMI
        case 'Weight': return '#FF9800'; // Orange for Weight
        case 'Height': return '#9C27B0'; // Purple for Height
        case 'Heart Rate': return '#F44336'; // Red for Heart Rate
        case 'Temp': return '#00BCD4'; // Cyan for Temperature
        default: return '#2196F3';
      }
    };

    // Define Y-axis ranges for different vitals
    const getYAxisRange = () => {
      switch (selectedVital) {
        case 'BP':
          return { min: 80, max: 160 };
        case 'BMI':
          return { min: 0, max: 100 };
        case 'Weight':
          return { min: 50, max: 100 };
        case 'Height':
          return { min: 0, max: 40 };
        case 'Heart Rate':
          return { min: 60, max: 120 };
        case 'Temp':
          return { min: 95, max: 100 };
        default:
          return { min: 0, max: 100 };
      }
    };

    const yAxisRange = getYAxisRange();

    return {
      chart: {
        type: 'line',
        height: 200,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      series: chartData.series,
      xaxis: {
        categories: chartData.categories,
        labels: {
          style: {
            colors: '#666',
            fontSize: '12px'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        min: yAxisRange.min,
        max: yAxisRange.max,
        labels: {
          style: {
            colors: '#666',
            fontSize: '12px'
          },
          formatter: (value) => {
            if (selectedVital === 'Temp') {
              return `${value.toFixed(1)}°F`;
            } else if (selectedVital === 'Weight') {
              return `${value} lbs`;
            } else if (selectedVital === 'Height') {
              return `${value} ft`;
            } else if (selectedVital === 'Heart Rate') {
              return `${value} bpm`;
            } else if (selectedVital === 'BMI') {
              return `${value}`;
            } else {
              return `${value}`;
            }
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      colors: [getVitalColor()],
      stroke: {
        curve: 'smooth',
        width: 3
      },
      markers: {
        size: 6,
        colors: [getVitalColor()],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 8
        }
      },
      grid: {
        borderColor: '#e0e0e0',
        strokeDashArray: 3,
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      tooltip: {
        theme: 'light',
        x: { show: false },
        y: {
          formatter: (value) => {
            if (selectedVital === 'Temp') {
              return `${value}°F`;
            } else if (selectedVital === 'Weight') {
              return `${value} lbs`;
            } else if (selectedVital === 'Height') {
              return `${value} ft`;
            } else if (selectedVital === 'Heart Rate') {
              return `${value} bpm`;
            } else if (selectedVital === 'BMI') {
              return `${value}`;
            } else {
              return `${value}`;
            }
          }
        }
      },
      dataLabels: {
        enabled: false
      }
    };
  };

  const renderChartView = () => {
    if (!isClient) {
      return (
        <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  bgcolor: viewMode === 'table' ? 'primary.main' : 'transparent',
                  color: viewMode === 'table' ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: viewMode === 'table' ? 'primary.dark' : 'action.hover'
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
                  bgcolor: viewMode === 'chart' ? 'primary.main' : 'transparent',
                  color: viewMode === 'chart' ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: viewMode === 'chart' ? 'primary.dark' : 'action.hover'
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
            {vitalsData.vitals.map((vital) => (
              <Button
                key={vital.name}
                variant={selectedVital === vital.name ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setSelectedVital(vital.name)}
                sx={{
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1.5,
                  minWidth: 'auto',
                  bgcolor: selectedVital === vital.name ? 'primary.main' : 'transparent',
                  color: selectedVital === vital.name ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: selectedVital === vital.name ? 'primary.dark' : 'action.hover'
                  }
                }}
              >
                {vital.name}
              </Button>
            ))}
          </Box>
        )}

        {/* Content Area */}
        <Box sx={{ 
          maxHeight: 350, 
          overflowY: 'auto', 
          pr: 1,
          minHeight: viewMode === 'chart' ? 200 : 'auto'
        }}>
          {viewMode === 'table' ? renderTableView() : renderChartView()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MyVitals;