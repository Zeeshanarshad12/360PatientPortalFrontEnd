import React from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * A widget's placeholder while its data loads — the same rows DashboardSkeleton shows before
 * the dashboard is ready, so a widget goes from placeholder straight to its content instead
 * of a spinner.
 */
const WidgetLoadingRows: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <Box sx={{ width: '100%' }} aria-busy="true" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} variant="rectangular" height={28} sx={{ mb: i === rows - 1 ? 0 : 1.5, borderRadius: 1 }} />
    ))}
  </Box>
);

export default WidgetLoadingRows;
