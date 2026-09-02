import { ReactNode } from 'react';

import { BoxProps, SxProps, Theme } from '@mui/material';

export interface SSelectButtonProps extends BoxProps {
  label?: string;
  tooltipText?: string;
  tooltipMinLength?: number;
  text: string;
  active?: boolean;
  hideCheckbox?: boolean;
  disabled?: boolean;
  activeRemove?: boolean;
  endIcon?: ReactNode;
  startContent?: ReactNode;
  textNoBreak?: boolean;
  labelSx?: SxProps<Theme>;
}
