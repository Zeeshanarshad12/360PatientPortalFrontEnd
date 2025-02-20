// scrollbarStyles.js

import { useTheme } from '@mui/material';

const useScrollbarStyles = () => {
  const theme = useTheme();
  return {
    '::-webkit-scrollbar': {
      backgroundColor: `${theme.colors.alpha.black[1]}`,
      display: 'block',
      transition: '0.5s',
      width: '5px'
    },
    '::-webkit-scrollbar-track': {
      // backgroundColor: '#ffffff',
      backgroundColor: 'transparent',
      borderRadius: `${theme.general.borderRadiusLg}`,
      transition: '0.5s'
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: `${theme.colors.alpha.black[1]}`,
      width: '100px',
      borderRadius: `${theme.general.borderRadiusLg}`,
      cursor: 'pointer'
    },
    '::-webkit-scrollbar-track:hover': {
      backgroundColor: 'rgba(0,0,0,0.02)'
    },
    '::-webkit-scrollbar-thumb:hover': {
      backgroundColor: `${theme.colors.alpha.black[10]}`,
      cursor: 'pointer'
    },
    '::-webkit-scrollbar-button': {
      display: 'none',
      backgroundColor: '#ffffff',
      borderRadius: `${theme.general.borderRadiusLg}`
    }
  };
};

export default useScrollbarStyles;
