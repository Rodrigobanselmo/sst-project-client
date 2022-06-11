import { ElementType, ReactNode } from 'react';

import { BoxProps, IconProps } from '@mui/material';

export interface ISTagButtonProps extends BoxProps {
  text?: string;
  bg?: string;
  large?: boolean;
  icon?: ElementType<any>;
  iconProps?: IconProps;
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  active?: boolean;
  tooltipTitle?: ReactNode;
}
