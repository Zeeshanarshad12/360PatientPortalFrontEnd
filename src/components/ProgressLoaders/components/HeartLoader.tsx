import React from 'react';
import { Box } from '@mui/material';

export default function HeartLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(85vh - 64px)',
        width: '100%',
        fontWeight: 'bold',
      }}
    >
      <svg
        width="170"
        height="170"
        viewBox="0 0 500 500"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>
            {`
              .heart {
                fill: none;
                stroke: #1976d2; /* MUI primary.main */
                stroke-width: 8;
              }

              .pulse-line {
                fill: none;
                stroke: #1976d2;
                stroke-width: 6;
                stroke-dasharray: 600;
                stroke-dashoffset: 600;
                animation: pulse 2s linear infinite;
              }

              @keyframes pulse {
                to {
                  stroke-dashoffset: 0;
                }
              }
            `}
          </style>
        </defs>

        {/* Heart shape */}
        <path
          className="heart"
          d="M250 450s-120-85-150-150c-30-65 10-150 90-150 40 0 60 20 60 20s20-20 60-20c80 0 120 85 90 150s-150 150-150 150z"
        />

        {/* ECG Line in center */}
        <path
          className="pulse-line"
          d="M100 250 L160 250 L180 220 L200 280 L230 180 L260 280 L280 250 L400 250"
        />
      </svg>
    </Box>
  );
}