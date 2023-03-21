import { ElementType, ReactNode } from 'react';

import { BoxProps, IconProps } from '@mui/material';

import { STextProps } from '../SText/types';

export interface ISTagButtonProps extends BoxProps {
  text?: string;
  bg?: string;
  subText?: string;
  topText?: string;
  large?: boolean;
  icon?: ElementType<any> | null;
  iconProps?: IconProps;
  loading?: boolean;
  searchAllEmployees?: boolean;
  disabled?: boolean;
  error?: boolean;
  showOnHover?: boolean;
  active?: boolean;
  outline?: boolean;
  tooltipTitle?: ReactNode;
  textProps?: STextProps;
  borderActive?: 'error' | 'info' | 'warning' | 'success' | 'primary';
}
