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

interface Props {
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const CurrentMedications: React.FC<Props> = ({ dragHandleProps }) => {
  const medications = widgetContent.currentMedications.data;

  return (
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
            {widgetContent.currentMedications.title}
            <Chip
              label={medications.length}
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

        {/* Scrollable Medications List */}
        <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1 }}>
          {medications.map((med: any, index: number) => (
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
              {/* "New" Badge */}
              {med.isNew && (
                <Chip
                  label="New"
                  color="primary"
                  size="small"
                  sx={{
                    position: 'absolute',
                    right: 8,
                    fontSize: '0.75rem',
                    borderRadius: '10px',
                    mr: 1
                  }}
                />
              )}

              {/* Medication Details */}
              <Typography fontWeight="bold">{med.name}</Typography>
              <Typography variant="body2" color="text.primary">
                {med.frequency}
              </Typography>
              <Typography variant="body2" color="text.primary">
                Prescribe by {med.prescribedBy}
              </Typography>
              <Typography variant="body2" color="text.primary">
                From: {med.duration.start} | End : {med.duration.end}
              </Typography>
            </Box>
          ))}
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
            See all Medications
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CurrentMedications;
