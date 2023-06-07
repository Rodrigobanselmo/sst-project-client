/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, ReactNode } from 'react';

import { SFlexProps } from 'components/atoms/SFlex/types';
import { STextProps } from 'components/atoms/SText/types';
import { STooltipProps } from 'components/atoms/STooltip/types';

export type ImageRowProps = SFlexProps & {
  url?: string;
  alt?: string;
  loading?: boolean;
  clickable?: boolean;
  imageProps?: any;
  tooltipProps?: Partial<STooltipProps>;
};
