/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType } from 'react';

import { BoxProps } from '@mui/material';

export type ITagAction =
  | 'add'
  | 'delete'
  | 'edit'
  | 'success'
  | 'error'
  | 'warning'
  | 'schedule'
  | 'info'
  | 'upload'
  | 'version'
  | 'select'
  | 'none';

export interface ISTagProps extends BoxProps {
  text?: string;
  action?: ITagAction;
  icon?: ElementType<any>;
}
