import { CircularProgressProps } from '@mui/material/CircularProgress';
import { IconButtonProps } from '@mui/material/IconButton';
import { PropsWithChildren } from 'react';
import { STooltipProps } from '../STooltip/STooltip.types';

export type SIconButtonProps = PropsWithChildren<{
  loading?: boolean;
  tooltip?: string;
  circularProps?: CircularProgressProps;
  bg?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
  iconButtonProps?: IconButtonProps;
  onClick?: IconButtonProps['onClick'];
  tooltipProps?: Partial<STooltipProps>;
}>;
