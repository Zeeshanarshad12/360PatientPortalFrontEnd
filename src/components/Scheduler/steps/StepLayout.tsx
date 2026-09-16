import React from 'react';
import { Box, Typography } from '@mui/material';

interface StepLayoutProps {
  children: React.ReactNode;
  footer: React.ReactNode;
  stepNumber?: number;
  stepLabel?: string;
}

// Bug 432480: Cancel/Continue must stay pinned at the bottom of the modal
// regardless of how much content a step renders above them. The scrollable
// step content and the footer are separate flex children so the footer never
// moves with content length.
const StepLayout: React.FC<StepLayoutProps> = ({
  children,
  footer,
  stepNumber,
  stepLabel
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
      {stepNumber != null && stepLabel && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'primary.lighter',
            borderRadius: 1,
            px: 1.5,
            py: 0.75,
            mb: 1.5
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 'bold',
              flexShrink: 0
            }}
          >
            {stepNumber}
          </Box>
          <Typography fontWeight="bold" color="primary.main">
            {stepLabel}
          </Typography>
        </Box>
      )}
      {children}
    </Box>
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        pt: 2,
        mt: 1,
        borderTop: '1px solid #e0e0e0',
        flexShrink: 0
      }}
    >
      {footer}
    </Box>
  </Box>
);

export default StepLayout;
