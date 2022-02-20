/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType } from 'react';

import { BoxProps, IconProps } from '@mui/material';

export interface ISTagButtonProps extends BoxProps {
  text?: string;
  large?: boolean;
  icon?: ElementType<any>;
  iconProps?: IconProps;
  loading?: boolean;
  disabled?: boolean;
}
