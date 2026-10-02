import React from 'react';
import { Box, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import DashboardSkeleton from '@/components/Dashboard/components/DashboardSkeleton';

const HEADER_HEIGHT = 70;
const SIDEBAR_WIDTH = 280;

/**
 * The portal's frame (header + sidebar) with the empty dashboard's widget skeletons, shown
 * while the signed-in app starts up (redux-persist restoring the session in _app) — so a
 * patient who just signed in sees the portal loading instead of a white screen. Mirrors
 * SharedLayout / CollapsedSidebarLayout's sizes; needs only the theme (no store or contexts).
 */
const AppShellSkeleton: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }} aria-busy="true" aria-label="Loading">
      <Box
        sx={{
          height: HEADER_HEIGHT,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: 1
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/statics/Logo_PP.svg" alt="Patient Portal" style={{ height: isMobile ? 32 : 48, width: 'auto' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!isMobile && <Skeleton variant="rectangular" width={260} height={40} sx={{ borderRadius: 1 }} />}
          <Skeleton variant="circular" width={40} height={40} />
          {!isMobile && <Skeleton variant="text" width={180} height={28} />}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {!isMobile && (
          <Box sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, bgcolor: '#FFFFFF', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)', px: 2, py: 2.5 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, px: 1 }}>
                <Skeleton variant="rectangular" width={24} height={24} sx={{ borderRadius: 1 }} />
                <Skeleton variant="text" width={140 - (i % 3) * 20} height={24} />
              </Box>
            ))}
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden', ml: '5px' }}>
          <DashboardSkeleton />
        </Box>
      </Box>
    </Box>
  );
};

export default AppShellSkeleton;
