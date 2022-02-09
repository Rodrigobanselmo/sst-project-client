import { TooltipProps } from '@mui/material';

export interface STooltipProps extends Omit<TooltipProps, 'title'> {
  withWrapper?: boolean;
  title?: string;
  minLength?: number;
}
