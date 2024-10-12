import { ButtonProps } from '@mui/material';
import { MouseEventHandler } from 'react';

export type SButtonProps = {
  onClick: MouseEventHandler<HTMLButtonElement> | undefined;
  text?: string;
  tooltip?: string;
  icon?: any;
  color?: 'normal' | 'success' | 'info' | 'primary' | 'paper';
  variant?: 'text' | 'outlined' | 'contained';
  buttonProps?: ButtonProps;
};
