import SplitButton from "@/components/ThemeComponent/SplitButton";
import { Box } from "@mui/material";
import React from "react";

const ShareHealthInfo = () => {
  return (
    <Box ml={1}>
      <SplitButton
        size="small"
        height="34.6px"
        options={["View", "Share"]}
        handleClick={() => {
          console.log("Hello");
        }}
        initialSelectedIndex={0}
      />
    </Box>
  );
};

export default ShareHealthInfo;
