import { ReactNode } from 'react';

import { TooltipProps } from '@mui/material';

export interface STooltipProps extends Omit<TooltipProps, 'title'> {
  withWrapper?: boolean;
  title?: ReactNode;
  minLength?: number;
}
