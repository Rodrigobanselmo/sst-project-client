/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, ReactNode } from 'react';

import { SFlexProps } from 'components/atoms/SFlex/types';
import { STextProps } from 'components/atoms/SText/types';

export type TextIconRowProps = SFlexProps & {
  icon?: ElementType<any>;
  lineNumber?: number;
  tooltipTitle?: ReactNode;
  text?: ReactNode;
  loading?: boolean;
  clickable?: boolean;
  textProps?: STextProps;
};
