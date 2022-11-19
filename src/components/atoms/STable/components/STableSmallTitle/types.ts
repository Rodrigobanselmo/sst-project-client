import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

/* eslint-disable @typescript-eslint/ban-types */
export type STableSmallTitleProps = BoxProps & {
  content?: ReactNode;
  text?: ReactNode;
  onAddClick?: () => void;
};
