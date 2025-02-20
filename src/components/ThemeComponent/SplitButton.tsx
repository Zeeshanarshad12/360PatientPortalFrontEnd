import * as React from "react";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { IoIosArrowDown } from "react-icons/io";
import { makeStyles } from "@mui/styles";

// Define types for props
interface Option {
  label: string;
  disabled?: boolean;
}

interface SplitButtonProps {
  options?: string[] | Option[];
  objectBasedOptionBool?: boolean;
  objectBasedOptions?: Option[];
  initialSelectedIndex?: number;
  handleClick?: (option: string | Option) => void;
  dontShowIndexItem?: number;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  height?: string;
}

const useStyles = makeStyles({
  menuItemHover: {
    "&:hover": {
      backgroundColor: "rgb(216, 232, 248) !important",
    },
  },
});

const SplitButton: React.FC<SplitButtonProps> = ({
  options,
  objectBasedOptionBool,
  objectBasedOptions,
  initialSelectedIndex,
  handleClick,
  dontShowIndexItem = 0,
  size = "medium",
  disabled = false,
  height = "39px",
}) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] =
    React.useState(initialSelectedIndex);

  const UseOption = objectBasedOptionBool ? objectBasedOptions : options;

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement>,
    index: number
  ) => {
    setOpen(false);
    setSelectedIndex(index);
    handleClick(UseOption[index]);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  return (
    <React.Fragment>
      <ButtonGroup
        style={{ height }}
        disabled={disabled}
        variant="contained"
        ref={anchorRef}
        aria-label="Button group with a nested menu"
      >
        <Button
          size={size}
          disabled={disabled}
          sx={{
            borderRadius: "5px",
          }}
        >
          Share Health Info
        </Button>
        <Button
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
          sx={{
            p: 0,
            minWidth: "28px !important",
            borderRadius: "5px",
          }}
        >
          <IoIosArrowDown />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        style={{ zIndex: 1 }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper sx={{ zIndex: 1 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {objectBasedOptionBool
                    ? objectBasedOptions
                        .slice(dontShowIndexItem)
                        .map((option, index) => (
                          <MenuItem
                            key={index}
                            disabled={option.disabled}
                            selected={index === selectedIndex}
                            onClick={(event) =>
                              handleMenuItemClick(event, index)
                            }
                            className={classes.menuItemHover}
                          >
                            {option.label}
                          </MenuItem>
                        ))
                    : options.map((option, index) => (
                        <MenuItem
                          key={option}
                          disabled={false} // Assuming all options are not disabled here
                          selected={index === selectedIndex}
                          onClick={(event) => handleMenuItemClick(event, index)}
                          className={classes.menuItemHover}
                        >
                          {option}
                        </MenuItem>
                      ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
};

export default SplitButton;
