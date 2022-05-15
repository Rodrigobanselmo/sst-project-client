/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType } from 'react';

import { STextProps } from 'components/atoms/SText/types';

export interface SPageTitleProps extends STextProps {
  icon?: ElementType<any>;
}
