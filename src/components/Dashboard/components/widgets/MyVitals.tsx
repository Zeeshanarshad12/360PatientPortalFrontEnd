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
import { Console } from 'console';

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const MyVitals: React.FC<Props> = ({ dragHandleProps }) => {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [selectedVital, setSelectedVital] = useState("BP");
  const [isClient, setIsClient] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    setIsClient(true);
  }, []);



  const [dates, setDates] = useState<string[]>([]);
  const [vitals, setVitals] = useState<{ name: string; values: string[] }[]>([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const Obj = { PatientId: localStorage.getItem("patientID") };
  //       const response = await dispatch(getpatientvitals(Obj)).unwrap();
  //       const data = response.result;
  //       debugger;
  //       // Build Dates
  //       const extractedDates = data.map(d => {
  //         const dateObj = new Date(d.sessionDate);
  //         const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // 01–12
  //         const day = String(dateObj.getDate()).padStart(2, "0");        // 01–31
  //         return `${month}/${day}`;
  //       });
  //       setDates(extractedDates);

  //       // Define which vitals you want to show
  //       const allowedVitals = ["Blood Pressure", "BMI Percentile", "Body Weight", "Body Height", "Heart Rate", "Pain Level", "Temperature"];

  //       const vitalsMap: Record<string, string[]> = {};

  //       data.forEach(day => {
  //         day.patientVitalViewModels.forEach(vital => {
  //           const name = vital.vitalName;

  //           // Show only allowed vitals
  //           if (!allowedVitals.includes(name)) return;

  //           let value;
  //           if (name.toLowerCase() === "bp" || name.toLowerCase() === "blood pressure") {
  //             const systolic = vital.listOfPatientVitals[0]?.value || "-";
  //             const diastolic = vital.listOfPatientVitals[1]?.value || "-";
  //             value = `${systolic}/${diastolic}`;
  //           } else {
  //             value = vital.listOfPatientVitals[0]?.value || "-";
  //           }

  //           if (!vitalsMap[name]) vitalsMap[name] = [];
  //           vitalsMap[name].push(value);
  //         });
  //       });

  //       // Convert vitalsMap to array and sort according to allowedVitals order
  //       const vitalsArray = allowedVitals
  //         .filter(name => vitalsMap[name]) // Only include ones that exist
  //         .map(name => ({
  //           name,
  //           values: vitalsMap[name]
  //         }));

  //       setVitals(vitalsArray);



  //     } catch (error) {
  //       console.error("Error fetching vitals:", error);
  //     }
  //   };

  //   fetchData();
  // }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const Obj = { PatientId: localStorage.getItem("patientID") };
        const response = await dispatch(getpatientvitals(Obj)).unwrap();
        const data = response.result;

        // Build Dates
        const extractedDates = data.map(d => {
          const dateObj = new Date(d.sessionDate);
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const day = String(dateObj.getDate()).padStart(2, "0");
          return `${month}/${day}`;
        });
        setDates(extractedDates);

        // Define which vitals you want to show
        const allowedVitals = [
          "Blood Pressure",
          "BMI Percentile",
          "Body Weight",
          "Body Height",
          "Heart Rate",
          "Pain Level",
          "Temperature"
        ];

        // Define mapping for abbreviations
        const vitalNameMapping = {
          "Blood Pressure": "BP",
          "BMI Percentile": "BMI",
          "Body Weight": "Weight (lbs)",
          "Body Height": "Height (ft-in)",
          "Heart Rate": "Heart Rate (bpm)",
          "Pain Level": "Pain Scale",
          "Temperature": "Temp (°F)"
        };

        const vitalsMap = {};

        data.forEach(day => {
          day.patientVitalViewModels.forEach(vital => {
            let originalName = vital.vitalName;

            // Show only allowed vitals
            if (!allowedVitals.includes(originalName)) return;

            // Replace with short form if in mapping
            const displayName = vitalNameMapping[originalName] || originalName;

            let value;
            // if (
            //   originalName.toLowerCase() === "bp" ||
            //   originalName.toLowerCase() === "blood pressure"
            // ) {
            //   const systolic = vital.listOfPatientVitals[0]?.value || "-";
            //   const diastolic = vital.listOfPatientVitals[1]?.value || "-";
            //   value = `${systolic}/${diastolic}`;
            // } else {
            //   value = vital.listOfPatientVitals[0]?.value || "-";
            // }
    debugger;
            if (
              originalName.toLowerCase() === "bp" ||
              originalName.toLowerCase() === "blood pressure"
            ) {
              const systolic = vital.listOfPatientVitals[0]?.value || "-";
              const diastolic = vital.listOfPatientVitals[1]?.value || "-";
              value = `${systolic}/${diastolic}`;
            }
            else if (
              originalName.toLowerCase() === "body height" ||
              originalName.toLowerCase() === "height"
            ) {
              const feet = vital.listOfPatientVitals[0]?.value || "-";
              const inches = vital.listOfPatientVitals[1]?.value || "-";
              value = `${feet}'${inches}"`;  // Example: 5'4"
            }
        
            else if(
              originalName.toLowerCase() === "pain level" ||
              originalName.toLowerCase() === "pain level"
            )
            {
              const PainScale = vital.listOfPatientVitals[0]?.value || "0";
              const PainUnit = vital.listOfPatientVitals[0]?.painScale ;
              value = `${PainScale} - ${PainUnit}`;
            }
            else {
              value = vital.listOfPatientVitals[0]?.value || "-";
            }


            if (!vitalsMap[displayName]) vitalsMap[displayName] = [];
            vitalsMap[displayName].push(value);
          });
        });

        // Convert vitalsMap to array and sort according to allowedVitals order
        const vitalsArray = allowedVitals
          .map(name => vitalNameMapping[name] || name) // Map to display names
          .filter(name => vitalsMap[name]) // Only include existing
          .map(name => ({
            name,
            values: vitalsMap[name]
          }));

        setVitals(vitalsArray);
      } catch (error) {
        console.error("Error fetching vitals:", error);
      }
    };

    fetchData();
  }, [dispatch]);

  const renderTableView = () => (
    <TableContainer component={Paper} sx={{ boxShadow: 'none', bgcolor: 'transparent' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ borderBottom: '1px solid #e0e0e0', color: 'text.secondary', fontWeight: 'bold', pb: 1 }}>
              Vitals
            </TableCell>
            {dates.map((date, index) => (
              <TableCell
                key={index}
                align="center"
                sx={{ borderBottom: '1px solid #e0e0e0', color: 'text.secondary', fontWeight: 'bold', pb: 1 }}
              >
                {date}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {vitals.map((vital, index) => (
            <TableRow key={index}>
              <TableCell sx={{ borderBottom: '1px solid #e0e0e0', color: 'text.primary', fontWeight: 'medium', py: 1 }}>
                {vital.name}
              </TableCell>
              {vital.values.map((value, valueIndex) => (
                <TableCell
                  key={valueIndex}
                  align="center"
                  sx={{ borderBottom: '1px solid #e0e0e0', color: 'text.primary', py: 1 }}
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

  // Chart data ab direct vitals state & dates state se
  const getChartData = () => {
    debugger;
    const vital = vitals.find(v => v.name === selectedVital);
    if (!vital) return { series: [], categories: [] };

    const numericValues = vital.values.map(value => {
      if (selectedVital.toLowerCase().includes('blood pressure')) {
        return parseInt(value.split('/')[0]) || 0; // Systolic only
      }
      return parseFloat(value) || 0;
    });

    return {
      series: [
        {
          name: vital.name,
          data: numericValues
        }
      ],
      categories: dates
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
      'Temperature': '#00BCD4',
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
      stroke: { curve: 'smooth', width: 3 },
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
          formatter: (value) => {
            debugger;
            if (selectedVital.toLowerCase().includes('blood pressure')) return `${value} mmHg`;
            if (selectedVital.toLowerCase().includes('temperature')) return `${value}°F`;
            if (selectedVital.toLowerCase().includes('weight')) return `${value} lbs`;
            if (selectedVital.toLowerCase().includes('height')) return `${value} ft`;
            if (selectedVital.toLowerCase().includes('heart rate')) return `${value} bpm`;
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
            {vitals.map((vital) => (
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