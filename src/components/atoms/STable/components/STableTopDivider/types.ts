import { ElementType, ReactNode } from 'react';

import { BoxProps, IconProps } from '@mui/material';

/* eslint-disable @typescript-eslint/ban-types */
export type STableTopDividerProps = BoxProps & {
  iconProps?: IconProps;
  content: ReactNode;
  icon?: ElementType<any> | null | undefined;
};
