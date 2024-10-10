import { ButtonProps } from '@mui/material';

export type SButtonProps = {
  onClick: () => void;
  text?: string;
  tooltip?: string;
  icon?: any;
  color?: 'normal' | 'success' | 'info' | 'primary' | 'paper';
  variant?: 'text' | 'outlined' | 'contained';
  buttonProps?: ButtonProps;
};
