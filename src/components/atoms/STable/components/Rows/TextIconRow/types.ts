/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType } from 'react';

import { SFlexProps } from 'components/atoms/SFlex/types';

export type TextIconRowProps = SFlexProps & {
  icon?: ElementType<any>;
  lineNumber?: number;
  tooltipTitle?: string;
  text?: string;
};
