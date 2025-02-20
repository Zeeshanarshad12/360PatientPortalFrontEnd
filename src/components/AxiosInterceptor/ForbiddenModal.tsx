import { ThemeButton } from "@/components/ThemeComponent/Button";
import ThemeText from "@/components/ThemeComponent/ThemeHeading";
import { ClearCahceNLogout } from "@/slices/static";
import { useDispatch } from "@/store";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

const ForbiddenModal = (props) => {
  const { logout } = props;
  const dispatch = useDispatch();

  window.addEventListener("popstate", function (event) {
    const state = event.state;
    if (state && state.myCustomData) {
    } else {
    }
  });

  history.pushState({ myCustomData: "some data" }, "Title", "/");

  return (
    <Dialog open={true} maxWidth="lg">
      <DialogTitle
        sx={{
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <FiAlertTriangle style={{ fontSize: "2em", color: "orange" }} />
        <ThemeText headingType="main">Something went wrong!</ThemeText>
      </DialogTitle>
      <DialogContent sx={{ px: 5 }}>
        <ThemeText headingType="text" fontSize={14}>
          Please contact our support team at &nbsp;
          <a href="mailto:emrsupport@dataqhealth.com">
            emrsupport@dataqhealth.com
          </a>
        </ThemeText>
        <ThemeText
          headingType="text"
          sx={{ textAlign: "center" }}
          fontSize={14}
        >
          OR
        </ThemeText>
        <ThemeText headingType="text" fontSize={14}>
          Ask your practice admin to reset your user credentials.
        </ThemeText>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <ThemeButton
          onClick={() => {
            dispatch(ClearCahceNLogout());
            setTimeout(() => {
              localStorage.clear();
              logout({
                returnTo:
                  process.env.NEXT_PUBLIC_WIKIURL +
                  "Account/LogOutForConfluanceEHR?redirectURL=" +
                  process.env.NEXT_PUBLIC_ORIGIN_URI,
              });
            }, 500);
          }}
        >
          OK
        </ThemeButton>
      </DialogActions>
    </Dialog>
  );
};

export default ForbiddenModal;
