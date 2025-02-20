import { Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';
import * as React from 'react';

function SnackbarCloseButton({ key }) {
  const { closeSnackbar } = useSnackbar();

  return (
    <IconButton onClick={() => closeSnackbar(key)}>
      <Close style={{color:'white'}}/>
    </IconButton>
  );
}

export default SnackbarCloseButton;