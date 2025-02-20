import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const CircularProgressLoader = () => {
  return (
    <>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)'
        }}
      >
        <CircularProgress size={60} color="primary" />
        <Typography
          variant="h6"
          sx={{ marginTop: 2, fontWeight: 'bold', color: '#333' }}
        >
          Loading...
        </Typography>
      </Box>
    </>
  );
};

export default CircularProgressLoader;