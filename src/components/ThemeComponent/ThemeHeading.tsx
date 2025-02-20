import React, { ReactNode } from "react";
import { Tooltip, Typography, useTheme } from "@mui/material";
import { SxProps } from "@mui/system";
import { Theme } from "@mui/material/styles";

interface Props {
  variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body1" | "body2";
  color?:
    | "white"
    | "black"
    | "primary"
    | "success"
    | "danger"
    | "red"
    | "warning"
    | "grey"
    | "lightgray";
  headingType?: "main" | "sub-bold" | "sub" | "text" | "mid-bold";
  fontSize?: number | string;
  textTransform?: boolean;
  bold?: boolean;
  semibold?: boolean;
  nowrap?: boolean;
  children?: ReactNode; // Corrected the type for children
  padding?: number | string;
  sx?: SxProps<Theme>;
  onClick?: React.MouseEventHandler<HTMLElement>; // Added type for onClick
  title?: ReactNode; // Corrected the type for title
  delay?: number;
  className?: string;
  component?: React.ElementType;
  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-start"
    | "top-end"
    | "bottom-start"
    | "bottom-end"
    | "left-start"
    | "left-end"
    | "right-start"
    | "right-end"; // Valid tooltip placements
  fieldLabel?: boolean;
  arrow?: boolean;
}

const ThemeText: React.FC<Props> = ({
  color = "black",
  variant = "h5",
  fontSize = "13px",
  children,
  padding = "0px 0px 0px 0px",
  headingType = "text",
  textTransform = false,
  bold = false,
  semibold = false,
  nowrap = false,
  sx,
  onClick,
  className = "",
  title = "",
  delay = 800,
  placement = "top", // Default value
  fieldLabel = false,
  arrow = true,
  ...otherProps // Spread any additional props
}) => {
  const theme = useTheme();

  return (
    <Tooltip
      enterNextDelay={delay}
      placement={placement}
      title={
        title ? (
          <div style={{ maxHeight: "35vh", overflowY: "auto" }}>{title}</div>
        ) : (
          ""
        )
      }
      arrow={arrow}
    >
      <Typography
        sx={{ ...sx, marginBottom: fieldLabel && "7px" }}
        className={className}
        variant={headingType === "text" ? "h6" : variant}
        textTransform={textTransform ? "capitalize" : "none"}
        noWrap={nowrap}
        fontSize={{
          md:
            headingType === "main"
              ? 20
              : headingType === "sub-bold"
              ? 18
              : headingType === "sub"
              ? 14
              : headingType === "mid-bold"
              ? 16
              : fieldLabel
              ? "14px"
              : fontSize,
          xs: 12,
        }}
        fontWeight={bold ? "bold" : semibold ? 600 : undefined}
        color={
          color === "white"
            ? "#FFFFFF"
            : color === "black"
            ? "#223354"
            : color === "primary"
            ? theme.colors.primary.main
            : color === "success"
            ? theme.colors.success.main
            : color === "red"
            ? "#F64A4A"
            : color === "grey"
            ? "#A0AABA"
            : color === "lightgray"
            ? "lightgray"
            : theme.colors.warning.main
        }
        p={padding}
        onClick={onClick}
        {...otherProps}
      >
        {children}
      </Typography>
    </Tooltip>
  );
};

export default ThemeText;
