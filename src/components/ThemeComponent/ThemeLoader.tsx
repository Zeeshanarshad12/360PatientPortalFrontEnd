import React from 'react';
import { Box, CircularProgress, Dialog, Grow, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';

interface ThemeLoaderProps {
  width?: string;
  loader: boolean;
}

const ThemeLoader: React.FC<ThemeLoaderProps> = ({
  width = '25px',
  loader
}) => {
  const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>
  ) {
    return <Grow ref={ref} {...props} />;
  });
  return (
    <Dialog
      open={loader}
      TransitionComponent={Transition}
      keepMounted
      aria-describedby="alert-dialog-slide-description"
      sx={{
        '& .MuiDialog-paper': {
          boxShadow: 'none',
          border: 'none',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'transparent',
          textAlign: 'center'
        }
      }}
    >
      <CircularProgress size={50} color="primary" />
      <Box sx={{ display: 'flex', mt: 1 }}>
        <Typography fontSize={14} sx={{ width: '100%' }}>
          Setting up Patient Portal for you, please wait{' '}
          <span className="pulsating-ellipsis">
            <span className="dotpulse">.</span>
            <span className="dotpulse">.</span>
            <span className="dotpulse">.</span>
          </span>
        </Typography>
      </Box>
    </Dialog>
  );
};

export default ThemeLoader;
