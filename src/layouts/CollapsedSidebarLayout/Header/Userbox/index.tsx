import { useRef, useState } from "react";

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
        color: ${theme.palette.secondary.light}
`
);

function HeaderUserbox() {
  const router = useRouter();
  let userDetails: string;
  const { user } = useAuth0();
  // const userName: string = user?.email;
  const userName: string = localStorage.getItem("Email");
  if (typeof window !== "undefined") {
    userDetails = IsParsable(localStorage.getItem("user"))
      ? JSON.parse(localStorage.getItem("user"))
      : false;
  }

  const Role = localStorage.getItem("UserAccessType");
  const ref = useRef<HTMLInputElement>(null);
  const [isOpen, setOpen] = useState<boolean>(false);

  const namePart = userName.split("@")[0]; 
  const nameParts = namePart.split("."); 

  // Get first letter of each part (uppercase)
  const initials = nameParts
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const { logout } = useAuth0();
  const theme = useTheme();

  if (userDetails === undefined) {
    return <>Loading..</>;
  } else {
    return (
      <>
        <UserBoxButton color="secondary"  onClick={handleOpen} >
          <Avatar
            variant="rounded"
          alt={userName}
            {...stringAvatar(userName)}
          />
          <Box
            component="span"
            sx={{
              display: { xs: "none", md: "inline-block" },
            }}
          >
            <UserBoxText>
              <UserBoxLabel variant="body1"  id="userbox" sx={{ color: (theme) => theme.palette.text.primary }}>
                {userName ? userName : ""}
              </UserBoxLabel>
              <UserBoxDescription variant="body2">{Role} </UserBoxDescription>
            </UserBoxText>
          </Box>
          <Box
            component="span"
            sx={{
              display: { xs: "none", sm: "inline-block" },
            }}
          >
            <ExpandMoreTwoToneIcon
              sx={{
                ml: 1,
              }}
            />
          </Box>
        </UserBoxButton>
        <Popover
          className="app-action"
          disableScrollLock
          anchorEl={ref.current}
          onClose={handleClose}
          open={isOpen}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuUserBox
            sx={{
              minWidth: 210,
            }}
            display="flex"
          >
            <Avatar
              variant="rounded"
              alt={userName}
              {...stringAvatar(userName)}
            />
            <UserBoxText>
              <UserBoxLabel variant="body1">{userName}</UserBoxLabel>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: `${theme.palette.secondary.light}`,
                }}
              >
                <span>{Role}</span>
              </div>
            </UserBoxText>
          </MenuUserBox>
          <Divider />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Divider
              sx={{
                mb: 0,
              }}
            />
            <Box>
              <Button
                sx={{ color: "gray" }}
                fullWidth
                onClick={async () =>{
                  // logout({ returnTo: process.env.NEXT_PUBLIC_ORIGIN_URI })
                  localStorage.clear()
                  router.push(process.env.NEXT_PUBLIC_ORIGIN_URI)
                }
                }
              >
                <span style={{ marginRight: "5px", marginTop: "5px" }}>
                  <Image
                    src={`${Icons.logout}`}
                    alt="Image"
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
}

export default HeaderUserbox;
