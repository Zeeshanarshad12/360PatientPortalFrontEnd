import { Button, IconButton, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { MouseEvent } from 'react';
import { Icons } from '@/icons/themeicons';
import { SxProps } from '@mui/system';
import Image from 'next/image';

interface Props {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error';
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (e: MouseEvent<HTMLButtonElement>) => void;
  onMouseOver?: (e: MouseEvent<HTMLButtonElement>) => void;
  form?: string;
  Iconbuttontype?:
  | 'add'
  | 'edit'
  | 'cross'
  | 'delete'
  | 'print'
  | 'save'
  | 'saveblue'
  | 'setting'
  | 'crossred'
  | 'Hamburger'
  | 'history'
  | 'add2'
  | 'editpen'
  | 'editgrey'
  | 'deletegrey'
  | 'addwithcircle'
  | 'Icon_trash_red'
  | 'eye'
  | 'Icon_trash';
  buttontype?: 'cancel' | '';
  size?: 'small' | 'medium' | 'large';
  type?: 'submit' | 'reset' | 'button' | undefined;
  Iconsize?: string;
  minWidth?: string;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  component?: React.ElementType;
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
  id?: string;
  borderRadius?: boolean;
}

export const ThemeButton: React.FC<Props> = ({
  startIcon,
  endIcon,
  variant = 'contained',
  color = 'primary',
  className,
  onClick,
  onMouseEnter,
  onMouseOver,
  form,
  children,
  size = 'medium',
  buttontype,
  minWidth,
  disabled,
  type,
  sx,
  fullWidth,
  component,
}) => {
  const useStyles = makeStyles({
    root: {
      '& .MuiButton-startIcon': {
        marginRight: '5px'
      },
      '& .MuiButton-endIcon': {
        marginLeft: '5px'
      }
    },
    cancel: {
      background: '#F3F3F3 !important',
      color: 'black !important',
      boxShadow: '0px 2px 3px #0000005C !important'
    }
  });
  const classes = useStyles();

  return (
    <Button
      component={component}
      className={
        (className
          ? className
          : buttontype
            ? classes?.[`${buttontype}`]
            : classes?.root) + ' no-shadow'
      }
      variant={variant}
      size={size}
      form={form}
      fullWidth={fullWidth}
      color={color}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseOver={onMouseOver}
      sx={{
        minWidth: minWidth,
        border:
          variant == 'contained' &&
          !disabled &&
          buttontype !== 'cancel' &&
          color == 'primary' &&
          '1px solid #006AD4',
        borderRadius: '5px',
        ...sx

        // boxShadow:
        //   variant == 'contained' ? '0px 0px 3px #0000005C !important' : ''
        // variant == 'contained' ? '0px 3px 3px #0000005C !important' : ''
      }}
      disabled={disabled}
      type={type}
    >
      {children}
    </Button>
  );
};

export const ThemeIconButton: React.FC<Props> = ({
  startIcon,
  color = 'primary',
  children,
  className,
  onClick,
  onMouseEnter,
  onMouseOver,
  Iconbuttontype = children ? '' : 'add',
  size = 'small',
  Iconsize = '26px',
  type,
  sx,
  disabled,
  id
}) => {
  return (
    <IconButton
      className={className}
      color={color}
      sx={sx}
      id={id}
      edge="start"
      onMouseEnter={onMouseEnter}
      onMouseOver={onMouseOver}
      onClick={onClick}
      type={type}
      disabled={disabled}
      size={size}
    >
      {Iconbuttontype ? (
        <Image
          alt={Iconbuttontype}
          style={{
            height: Iconsize,
            borderRadius: '4px'
          }}
          src={Icons?.[`${Iconbuttontype}`]}
        />
      ) : (
        startIcon
      )}
      {children ? children : ''}
    </IconButton>
  );
};
