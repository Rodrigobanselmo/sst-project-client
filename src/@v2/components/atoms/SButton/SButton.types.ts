import { BoxProps, ButtonProps } from '@mui/material';
import { MouseEventHandler, ReactElement, ReactNode } from 'react';

export type SButtonProps = {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  text?: string;
  tooltip?: string;
  icon?: ReactNode;
  rightIcon?: (() => JSX.Element) | React.ElementType;
  color?: 'normal' | 'success' | 'info' | 'primary' | 'paper' | 'danger';
  variant?: 'text' | 'shade' | 'contained' | 'outlined';
  buttonProps?: ButtonProps;
  loading?: boolean;
  disabled?: boolean;
  textProps?: BoxProps;
  size?: 's' | 'm' | 'l';
  minWidth?: (string | number)[] | string | number;
};
