import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { widgetContent } from '@/components/Dashboard/contexts/widgetData';

// Default widget arrangement, shown only until the saved layout and session
// are ready so the dashboard never appears as an empty area.
const DEFAULT_SKELETON_LAYOUT: string[][] = [
  ['currentMedications', 'myHealthConditions', 'labResults'],
  ['myVitals', 'myMedicalTimeline'],
  ['upcomingAppointments', 'allergies']
];

const WidgetSkeleton: React.FC<{ id: string }> = ({ id }) => (
  <Card sx={{ minHeight: 250, borderRadius: 3, mb: 2 }}>
    <CardContent sx={{ pb: 1 }}>
      <Box mb={2}>
        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: '1.25rem' }}>
          {widgetContent[id]?.title ?? <Skeleton width={160} />}
        </Typography>
      </Box>
      <Skeleton variant="rectangular" height={28} sx={{ mb: 1.5, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={28} sx={{ mb: 1.5, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={28} sx={{ mb: 1.5, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={28} sx={{ borderRadius: 1 }} />
    </CardContent>
  </Card>
);

const DashboardSkeleton: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        flexGrow: 1,
        padding: 1,
        overflowY: 'auto',
        height: 'calc(98vh - 60px)',
        backgroundColor: '#f5f5f5'
      }}
      aria-busy="true"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '25px',
          paddingRight: isMobile ? 0 : '10px'
        }}
      >
        {DEFAULT_SKELETON_LAYOUT.map((column, index) => (
          <Box
            key={index}
            sx={{
              flex: isMobile ? '1 1 100%' : 1,
              minWidth: isMobile ? '100%' : '300px'
            }}
          >
            {column.map((id) => (
              <WidgetSkeleton key={id} id={id} />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DashboardSkeleton;
