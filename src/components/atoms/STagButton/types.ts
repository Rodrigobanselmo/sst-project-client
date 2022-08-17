import { ElementType, ReactNode } from 'react';

import { BoxProps, IconProps } from '@mui/material';

import { STextProps } from '../SText/types';

export interface ISTagButtonProps extends BoxProps {
  text?: string;
  bg?: string;
  subText?: string;
  topText?: string;
  large?: boolean;
  icon?: ElementType<any>;
  iconProps?: IconProps;
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  showOnHover?: boolean;
  active?: boolean;
  tooltipTitle?: ReactNode;
  textProps?: STextProps;
}
