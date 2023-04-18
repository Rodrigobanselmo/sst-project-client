/* eslint-disable @typescript-eslint/ban-types */
import { ReactNode } from 'react';

import { SButtonProps } from 'components/atoms/SButton/types';
import { BoxProps } from '@mui/material';

export type STableButtonProps = Omit<SButtonProps, 'color'> & {
  text?: ReactNode;
  icon?: any;
  tooltip?: string;
  sm?: boolean;
  color?: string;
  iconColor?: string;
  boxProps?: BoxProps;
};
