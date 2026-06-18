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
import { useCurrentPatient } from '@/contexts/CurrentPatientContext';
import { isNull } from '@/utils/functions';
import moment from 'moment';

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const buildPanelKey = (orderId: number | string, testId: number | string) =>
  `${orderId}-${testId}`;

const isAbnormal = (obs: any) => {
  return Boolean(obs?.abnormalFlag?.trim()) || Boolean(obs?.abnormalityStatus);
};

const LabResults: React.FC<Props> = ({ dragHandleProps }) => {
  const [openPanels, setOpenPanels] = useState<Set<string>>(new Set());
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [labGroups, setLabGroups] = useState<any[]>([]);
  const { patientId, practiceId } = useCurrentPatient();

  const togglePanel = (
    event: React.MouseEvent,
    orderId: number | string,
    testId: number | string
  ) => {
    event.stopPropagation();
    const key = buildPanelKey(orderId, testId);
    setOpenPanels((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isNull(patientId) && !isNull(practiceId)) {
          const Obj = {
            PatientId: patientId,
            PracticeId: practiceId
          };
          const response = await dispatch(
            getunsignedlabordertestbypatientid(Obj)
          ).unwrap();

          const data = response?.result ?? [];
          setLabGroups(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching labs:', error);
        setLabGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, practiceId, patientId]);

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
                {widgetContent.labResults.title}
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
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
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
              {labGroups.length === 0 && (
                <Typography variant="body2" color="textSecondary">
                  No signed lab results.
                </Typography>
              )}

              {labGroups.map((group) => (
                <Box key={group.id} mb={2}>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="textPrimary"
                  >
                    {group.providerName}
                  </Typography>
                  {/* Lab Order Header */}
                  <Typography variant="body2" color="textPrimary">
                    {moment(group?.orderDate).format('MM/DD/YYYY')} |{' '}
                    {group.labName}
                  </Typography>

                  {/* Loop over labTests belonging to THIS order */}
                  {group.labTests &&
                    group.labTests.map((test: any) => {
                      const panelKey = buildPanelKey(group.id, test.id);
                      const isOpen = openPanels.has(panelKey);

                      return (
                        <Box key={test.id} mt={1}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ cursor: 'pointer' }}
                            onClick={(e) => togglePanel(e, group.id, test.id)}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="textPrimary"
                            >
                              {test.testCodeDescription}
                            </Typography>
                            <IconButton size="small">
                              {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Box>

                          <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Table size="small" sx={{ mt: 1 }} role="none">
                              <TableBody>
                                {test.labObservations &&
                                  test.labObservations.map((obs: any) => {
                                    const abnormal = isAbnormal(obs);

                                    return (
                                      <TableRow
                                        key={obs.id}
                                        sx={{ height: 40 }}
                                      >
                                        <TableCell
                                          sx={{
                                            maxWidth: 200,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                          }}
                                        >
                                          <Typography
                                            noWrap
                                            title={obs.alternateText}
                                          >
                                            {obs.alternateText}
                                          </Typography>
                                        </TableCell>
                                        <TableCell sx={{ width: 100 }}>
                                          <Typography
                                            sx={{
                                              color: abnormal
                                                ? 'error.main'
                                                : 'inherit',
                                              fontWeight: abnormal
                                                ? 'bold'
                                                : 'normal'
                                            }}
                                          >
                                            {obs.observationValue}
                                          </Typography>
                                        </TableCell>
                                        <TableCell
                                          align="right"
                                          sx={{
                                            width: 150,
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          <Typography>
                                            {obs.referranceRange} {obs.units}
                                          </Typography>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                              </TableBody>
                            </Table>
                          </Collapse>
                        </Box>
                      );
                    })}
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
