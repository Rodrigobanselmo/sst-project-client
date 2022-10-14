/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, ReactNode } from 'react';

import { BoxProps } from '@mui/material';

export type ITagActionColors =
  | 'add'
  | 'delete'
  | 'edit'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'upload'
  | 'main'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | 'none';

export interface ISTagProps extends BoxProps {
  text: ReactNode;
  action?: ITagActionColors;
  icon?: ElementType<any>;
}
