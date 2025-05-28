import { SFlexProps } from '@v2/components/atoms/SFlex/SFlex.types';
import { STextProps } from '@v2/components/atoms/SText/SText.types';
import { ReactNode } from 'react';

export type STagRowProps = {
  text: ReactNode;
  bottomText?: ReactNode;
  startAddon?: ReactNode;
  justify?: 'flex-start' | 'center' | 'flex-end';
  color?: string;
  border?: string;
  backgroundColor?: string;
  borderColor?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  lineNumber?: number;
  tooltipTitle?: ReactNode;
  boxProps?: SFlexProps;
  tooltipMinLength?: number;

  textProps?: STextProps;
  bottomTextProps?: STextProps;
};
