import { ReactNode } from 'react';

import { BoxProps, TooltipProps } from '@mui/material';

export interface STooltipProps extends Omit<TooltipProps, 'title'> {
  withWrapper?: boolean;
  title?: ReactNode;
  minLength?: number;
  boxProps?: BoxProps;
}
