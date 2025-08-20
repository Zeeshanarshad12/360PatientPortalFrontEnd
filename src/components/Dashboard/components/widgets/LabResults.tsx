import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Collapse,
  Box,
  Chip
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { widgetContent } from '@/components/Dashboard/contexts/widgetData';
import { getunsignedlabordertestbypatientid } from '@/slices/patientprofileslice';
import { useDispatch } from '@/store/index';
import CircularProgressLoader from '@/components/ProgressLoaders/components/Circular';

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const LabResults: React.FC<Props> = ({ dragHandleProps }) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [labGroups, setLabGroups] = useState<any[]>([]);

  const togglePanel = (event: React.MouseEvent, index: number) => {
    event.stopPropagation();
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const Obj = {
          PatientId: localStorage.getItem('patientID')
        };
        const response = await dispatch(getunsignedlabordertestbypatientid(Obj)).unwrap();
        const data = response.result;
        // ✅ wrap inside array
        setLabGroups([data]);
      } catch (error) {
        console.error("Error fetching labs:", error);
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
                {widgetContent.currentMedications.title}
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" fontWeight="bold">
                {widgetContent.labResults.title}
                <Chip
                  label={labGroups.length}
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

            <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
              {labGroups.map((group, index) => (
                <Box key={index} mb={2}>
                  <Typography variant="body2" fontWeight="bold" color="textPrimary" >
                    {group.providerName}
                  </Typography>
                  {/* Lab Order Header */}
                  <Typography variant="body2" color="textPrimary" >
                    {new Date(group.orderDate).toLocaleDateString()} | {group.labName}
                  </Typography>

                  {/* Loop over labTests */}
                  {group.labTests && group.labTests.map((test, tIndex) => (
                    <Box key={tIndex} mt={1}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ cursor: 'pointer' }}
                        onClick={(e) => togglePanel(e, tIndex)}
                      >
                        <Typography variant="subtitle1" fontWeight="bold" color="textPrimary">
                          {test.testCodeDescription}
                        </Typography>
                        <IconButton size="small">
                          {openIndexes.includes(tIndex) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>

                      <Collapse in={openIndexes.includes(tIndex)} timeout="auto" unmountOnExit>
                        <Table size="small" sx={{ mt: 1 }}>
                          <TableBody>
                            {test.labObservations && test.labObservations.map((obs, oIndex) => (
                              <TableRow key={oIndex} sx={{ height: 40 }}>   {/* ✅ Fixed row height */}
                                <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  <Typography noWrap title={obs.alternateText}>
                                    {obs.alternateText}
                                  </Typography>
                                </TableCell>

                                <TableCell sx={{ width: 100 }}>
                                  <Typography>
                                    {obs.observationValue}
                                  </Typography>
                                </TableCell>

                                <TableCell align="right" sx={{ width: 150, whiteSpace: 'nowrap' }}>
                                  <Typography>
                                    {obs.referranceRange} {obs.units}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Collapse>
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default LabResults;
