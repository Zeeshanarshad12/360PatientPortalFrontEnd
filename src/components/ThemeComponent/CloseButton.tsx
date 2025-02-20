import { IconButton } from '@mui/material';
import React from 'react';
import ClearIcon from '@mui/icons-material/Clear';

const CloseButton = (props) => {
  const { onClick, sx, color, fontSize } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{ padding: 0, margin: 0, minWidth: 0, ...sx }}
    >
      <ClearIcon
        sx={{
          color: color || 'black !important',
          fontWeight: 'bold',
          fontSize: fontSize || '30px'
        }}
      />
    </IconButton>
  );
};

export default CloseButton;
