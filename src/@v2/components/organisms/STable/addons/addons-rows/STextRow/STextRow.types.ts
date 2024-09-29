import { SFlexProps } from '@v2/components/atoms/SFlex/SFlex.types';
import { STextProps } from '@v2/components/atoms/SText/SText.types';
import { ReactNode } from 'react';

export type STextRowProps = {
  text: ReactNode;
  justify?: 'flex-start' | 'center' | 'flex-end';
  color?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  lineNumber?: number;
  tooltipTitle?: ReactNode;
  textProps?: STextProps;
  boxProps?: SFlexProps;
};
