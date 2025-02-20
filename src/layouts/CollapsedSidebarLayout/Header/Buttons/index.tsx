import { Box } from "@mui/material";
import HeaderNotifications from "./Notifications";

function HeaderButtons() {
  return (
    <Box
      sx={{
        ml: 1,
        display: "flex",
      }}
    >
      <Box
        sx={{
          opacity: 0.5,
          // mx: 0.5
        }}
        component="span"
      >
        <HeaderNotifications />
      </Box>
    </Box>
  );
}

export default HeaderButtons;
