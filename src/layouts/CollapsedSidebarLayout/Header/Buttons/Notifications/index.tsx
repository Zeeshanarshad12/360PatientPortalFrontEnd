import { alpha, Badge, IconButton, Tooltip, styled } from '@mui/material';
import { useRef } from 'react';
import NotificationsActiveTwoToneIcon from '@mui/icons-material/NotificationsActiveTwoTone';

const NotificationsBadge = styled(Badge)(
  ({ theme }) => `
    .MuiBadge-badge {
        background-color: ${alpha(theme.palette.error.main, 0.1)};
        color: ${theme.palette.error.main};
        min-width: 16px; 
        height: 16px;
        padding: 0;

        &::after {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            box-shadow: 0 0 0 1px ${alpha(theme.palette.error.main, 0.3)};
            content: "";
        }
    }
`
);

const IconButtonWrapper = styled(IconButton)(
  ({ theme }) => `
        width: ${theme.spacing(4)};
        height: ${theme.spacing(4)};
        padding:0px !important;
`
);

function HeaderNotifications() {
  const ref = useRef<HTMLButtonElement>(null); // Change type to HTMLButtonElement

  return (
    <>
      <Tooltip arrow title={'Coming soon'}>
        <IconButtonWrapper color="error" ref={ref} sx={{ p: 0 }}>
          <NotificationsBadge
            badgeContent={0}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            sx={{ p: 0 }}
          >
            <NotificationsActiveTwoToneIcon />
          </NotificationsBadge>
        </IconButtonWrapper>
      </Tooltip>
    </>
  );
}

export default HeaderNotifications;
