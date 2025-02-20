import { useEffect, useRef, useState } from "react";
import { Box, Popover, Tooltip, Typography, useTheme } from "@mui/material";
import { FaMapPin } from "react-icons/fa";
import Scrollbar from "@/components/Scrollbar";
import ThemeText from "@/components/ThemeComponent/ThemeHeading";
import { Icons } from "@/icons/themeicons";
import Image from "next/image";

function PracticeBox() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | null>(null);
  const [isOpen, setOpen] = useState<boolean>(false);

  // Dummy data for users and locations
  const users = [
    {
      name: "John Doe",
      locationNames: ["Peach Tree Road", "River Side Clinic"],
    },
    { name: "Alissa Doe", locationNames: ["Peach Tree Road"] },
  ];

  const groupedLocations: Record<string, string[]> = users.reduce(
    (acc, user) => {
      user.locationNames.forEach((location) => {
        if (!acc[user.name]) {
          acc[user.name] = [];
        }
        acc[user.name].push(location);
      });
      return acc;
    },
    {}
  );

  const theme = useTheme();

  const handleOpen = (): void => {
    // Measure the width of the Typography element
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPopoverWidth(rect.width);
    }
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleOutsideClick = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      ref.current.style.borderColor = "#d3d9e3"; // Reset border color to blue
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <>
      <Box
        color="secondary"
        ref={ref}
        onClick={handleOpen}
        sx={{
          p: 0,
          minWidth: "220px",
          maxWidth: "600px",
          display: "flex",
          justifyContent: "start",
          bgcolor: "white",
          gap: 1,
          borderRadius: "4px",
          border: `1px solid #d3d9e3`,
          ":hover": {
            border: `1px solid ${theme.colors.primary.main}`,
          },
          height: "40px",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "40px",
          }}
        >
          <Image
            src={Icons.locarrow}
            alt="Location arrow"
            width={20}
            height={20}
          />
        </Box>
        <Box>
          <Typography
            className="ellipsis-text"
            sx={{
              width: "max-content",
              maxWidth: "450px",
              lineHeight: 1.3,
              fontSize: "13px",
              color: "black",
              pr: 1,
            }}
            title="Practice Name"
          >
            {`John Doe`}
          </Typography>
          <Typography
            className="ellipsis-text"
            color="primary"
            sx={{
              width: "max-content",
              maxWidth: "450px",
              lineHeight: 1.3,
              fontSize: "13px",
              fontWeight: "600",
            }}
            title="Location Name"
          >
            {`Peach Tree Road`}
          </Typography>
        </Box>
      </Box>

      <Popover
        disableScrollLock
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        sx={{
          mt: 0.3,
          ".MuiPopover-paper": {
            border: `1px solid ${theme.colors.primary.main}`,
            minWidth: popoverWidth ? `${popoverWidth}px` : "220px",
            maxWidth: popoverWidth ? `${popoverWidth}px` : "500px",
            p: 0.5,
          },
        }}
      >
        <Box
          sx={{
            maxHeight: "20vh",
            height:
              Object?.keys(groupedLocations)?.length > 2 ? "20vh" : "12vh",
          }}
        >
          <Scrollbar>
            {Object?.keys(groupedLocations)?.map((user: string) => (
              <Box key={user}>
                <Box
                  sx={{
                    bgcolor: "#f7f8fa",
                    p: 0.5,
                    borderRadius: "4px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Box>
                    <Image
                      src={Icons.hospital}
                      alt="hospitals"
                      width={16}
                      height={16}
                      style={{ paddingRight: "4px", fontSize: "12px" }}
                    />
                  </Box>

                  <Tooltip title={user} arrow>
                    <Box>
                      <ThemeText
                        sx={{ fontSize: "12px", fontWeight: 700 }}
                        title={user}
                        nowrap
                      >
                        &nbsp;{user}
                      </ThemeText>
                    </Box>
                  </Tooltip>
                </Box>

                {groupedLocations[user]?.map((location, index) => (
                  <Tooltip title={location} arrow key={index}>
                    <Box
                      key={index}
                      sx={{
                        p: 0.5,
                        borderBottom: "1px solid #f7f8fa",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        ":hover": {
                          bgcolor: "#EBF3FF",
                        },
                      }}
                    >
                      <FaMapPin style={{ color: "#006AD4" }} />
                      <ThemeText sx={{ fontSize: "13px" }} nowrap>
                        {location}
                      </ThemeText>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            ))}
          </Scrollbar>
        </Box>
      </Popover>
    </>
  );
}

export default PracticeBox;
