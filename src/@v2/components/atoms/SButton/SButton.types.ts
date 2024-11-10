import { BoxProps, ButtonProps } from '@mui/material';
import { MouseEventHandler, ReactElement, ReactNode } from 'react';

export type SButtonProps = {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  text?: string;
  tooltip?: string;
  icon?: ReactNode;
  rightIcon?: (() => JSX.Element) | React.ElementType;
  color?: 'normal' | 'success' | 'info' | 'primary' | 'paper';
  variant?: 'text' | 'outlined' | 'contained';
  buttonProps?: ButtonProps;
  loading?: boolean;
  disabled?: boolean;
  textProps?: BoxProps;
};
