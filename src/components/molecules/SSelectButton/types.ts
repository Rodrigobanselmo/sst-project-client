import { BoxProps } from '@mui/material';

export interface SSelectButtonProps extends BoxProps {
  label?: string;
  tooltipText?: string;
  text: string;
  active?: boolean;
  disabled?: boolean;
  hideCheckbox?: boolean;
}
