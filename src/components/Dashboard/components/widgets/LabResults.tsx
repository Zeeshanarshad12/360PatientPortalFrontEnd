import React, { useState } from 'react';
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

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const LabResults: React.FC<Props> = ({dragHandleProps}) => {
  const labGroups = widgetContent.labResults.data;
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]); // First panel open by default

  const togglePanel = (event: React.MouseEvent, index: number) => {
    event.stopPropagation(); // ✅ Prevent DnD event interference
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
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
          {labGroups.map((group, index) => (
            <Box key={index} mb={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ cursor: group.panel ? 'pointer' : 'default' }}
                onClick={() =>
                  group.panel &&
                  setOpenIndexes((prev) =>
                    prev.includes(index)
                      ? prev.filter((i) => i !== index)
                      : [...prev, index]
                  )
                }
              >
                <Typography variant="subtitle1" fontWeight="bold" color="textPrimary">
                  {group.group}
                </Typography>
                {group.panel && (
                  <IconButton
                    size="small"
                    onClick={(e) => togglePanel(e, index)} // ✅ Call with event
                  >
                    {openIndexes.includes(index) ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </IconButton>
                )}
              </Box>

              <Typography variant="body2" color="textPrimary">
                {group.date} {group.provider && `| ${group.provider}`}
              </Typography>

              {group.panel && (
                <Collapse
                  in={openIndexes.includes(index)}
                  timeout="auto"
                  unmountOnExit
                >
                  <Table size="small" sx={{ mt: 1 }}>
                    <TableBody>
                      {group.panel.map((test, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Typography
                              color={test.critical ? 'error' : 'textPrimary'}
                              fontWeight={test.critical ? 'bold' : 'normal'}
                            >
                              {test.label}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              color={test.critical ? 'error' : 'textPrimary'}
                              fontWeight={test.critical ? 'bold' : 'normal'}
                            >
                              {test.value !== undefined ? test.value : ''}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              color={test.critical ? 'error' : 'textPrimary'}
                              fontWeight={test.critical ? 'bold' : 'normal'}
                            >
                              {test.normal}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Collapse>
              )}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default LabResults;
