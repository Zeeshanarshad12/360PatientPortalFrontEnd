'use client';

import React from 'react';
import { Box } from '@mui/material';
import { CommunicationSidebar } from './CommunicationSidebar';
import { ThreadView } from './ThreadView';

export const CommunicationBody: React.FC = () => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        padding: 1, // ← same as ConsentFormsLayout
        overflowY: 'hidden',
        height: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'row',
        gap: 0
      }}
    >
      <CommunicationSidebar />
      <ThreadView />
    </Box>
  );
};
