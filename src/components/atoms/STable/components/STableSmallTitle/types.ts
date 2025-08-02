import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

export type STableSmallTitleProps = BoxProps & {
  content?: ReactNode;
  text?: ReactNode;
  onAddClick?: () => void;
};
