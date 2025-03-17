import { SFlexProps } from '@v2/components/atoms/SFlex/SFlex.types';
import { STextProps } from '@v2/components/atoms/SText/SText.types';
import { STooltipProps } from '@v2/components/atoms/STooltip/STooltip.types';
import { ReactNode } from 'react';

export type STextRowProps = {
  text: ReactNode;
  bottomText?: ReactNode;
  startAddon?: ReactNode;
  justify?: 'flex-start' | 'center' | 'flex-end';
  color?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  lineNumber?: number;
  tooltipTitle?: ReactNode;
  boxProps?: SFlexProps;
  tooltipMinLength?: number;

  tooltipProps?: Partial<STooltipProps>;
  textProps?: Partial<STextProps>;
  bottomTextProps?: Partial<STextProps>;
  containerProps?: Partial<SFlexProps>;
};
