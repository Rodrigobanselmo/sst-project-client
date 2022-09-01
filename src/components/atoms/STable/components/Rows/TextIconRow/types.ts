/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, ReactNode } from 'react';

import { SFlexProps } from 'components/atoms/SFlex/types';

export type TextIconRowProps = SFlexProps & {
  icon?: ElementType<any>;
  lineNumber?: number;
  tooltipTitle?: ReactNode;
  text?: ReactNode;
  loading?: boolean;
  clickable?: boolean;
};
