import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Popover,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import ExpandMoreTwoToneIcon from "@mui/icons-material/ExpandMoreTwoTone";
import { IsParsable, stringAvatar } from "@/utils/functions";
import { useAuth0 } from "@auth0/auth0-react";
import { Icons } from "@/icons/themeicons";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAriaHiddenFixOnDialog } from "@/hooks/useAriaHiddenFixOnDialog";

const UserBoxButton = styled(Button)(
  ({ theme }) => `
    padding-left: ${theme.spacing(1)};
    padding-right: ${theme.spacing(1)};
    padding-top: 3px;
    padding-bottom: 3px;
`
);

const MenuUserBox = styled(Box)(
  ({ theme }) => `
    background: ${theme.colors.alpha.black[5]};
    padding: ${theme.spacing(2)};
`
);

const UserBoxText = styled(Box)(
  ({ theme }) => `
    text-align: left;
    padding-left: ${theme.spacing(1)};
`
);

const UserBoxLabel = styled(Typography)(
  ({ theme }) => `
    font-weight: ${theme.typography.fontWeightBold};
    color: ${theme.palette.secondary.main};
    display: block;
`
);

const UserBoxDescription = styled(Typography)(
  ({ theme }) => `
    color: ${theme.palette.secondary.light};
`
);

function HeaderUserbox() {
  const router = useRouter();
  const { logout } = useAuth0();
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpen = Boolean(anchorEl);

  useAriaHiddenFixOnDialog(isOpen);

  let userDetails: string;
  const userName: string = typeof window !== "undefined" ? localStorage.getItem("Email") : "";
  const Role = typeof window !== "undefined" ? localStorage.getItem("UserAccessType") : "";

  if (typeof window !== "undefined") {
    userDetails = IsParsable(localStorage.getItem("user"))
      ? JSON.parse(localStorage.getItem("user"))
      : false;
  }

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (userDetails === undefined) {
    return <>Loading...</>;
  }

  return (
    <>
      <UserBoxButton
        color="secondary"
        onClick={handleOpen}
        sx={{
          '&:focus, &:focus-visible': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
          }
        }}
      >
        <Avatar
          variant="rounded"
          alt={userName}
          {...stringAvatar(userName)}
        />
        <Box sx={{ display: { xs: "none", md: "inline-block" } }}>
          <UserBoxText>
            <Typography component="h2" variant="h6" id="userbox" sx={{ color: theme.palette.text.primary }}>
              {userName}
            </Typography>
            <UserBoxDescription variant="body2" style={{ color: '#000000' }}>
              {Role}
            </UserBoxDescription>
          </UserBoxText>
        </Box>
        <Box sx={{ display: { xs: "none", sm: "inline-block" } }}>
          <ExpandMoreTwoToneIcon sx={{ ml: 1 }} />
        </Box>
      </UserBoxButton>

      <Popover
        className="app-action"
        disableScrollLock
        anchorEl={anchorEl}
        onClose={handleClose}
        open={isOpen}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuUserBox sx={{ minWidth: 210 }} display="flex">
          <Avatar
            variant="rounded"
            alt={userName}
            {...stringAvatar(userName)}
          />
          <UserBoxText>
            <UserBoxLabel variant="body1" sx={{ color: theme.palette.text.primary }}>
              {userName}
            </UserBoxLabel>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              color: theme.palette.secondary.light
            }}>
              <span style={{ color: '#000000' }}>{Role}</span>
            </div>
          </UserBoxText>
        </MenuUserBox>
        <Divider />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Divider sx={{ mb: 0 }} />
          <Box>
            <Button
              sx={{
                color: "gray", '&:focus': {
                  outline: '2px solid #1976d2',
                  outlineOffset: '2px'
                },
                '&:focus-visible': {
                  outline: '2px solid #1976d2',
                  outlineOffset: '2px'
                }
              }}
              fullWidth
              onClick={() => {
                localStorage.clear();
                router.push(process.env.NEXT_PUBLIC_ORIGIN_URI);
              }}
            >
              <span style={{ marginRight: "5px", marginTop: "5px" }}>
                <Image
                  src={`${Icons.logout}`}
                  alt="Logout Icon"
                  width={20}
                  height={20}
                />
              </span>
              Logout
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
}

export default HeaderUserbox;
