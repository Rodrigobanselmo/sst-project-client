import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

import { STooltipProps } from '../STooltip/types';

export interface SHelpProps extends BoxProps {
  tooltip?: ReactNode;
  text?: string;
  /** Encaminhado ao STooltip (placement, PopperProps, componentsProps, etc.). */
  tooltipProps?: Omit<STooltipProps, 'title' | 'children'>;
}
