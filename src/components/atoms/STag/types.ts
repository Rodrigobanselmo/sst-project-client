/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType } from 'react';

import { BoxProps } from '@mui/material';

export interface ISTagProps extends BoxProps {
  text?: string;
  action?: 'add' | 'delete' | 'edit';
  icon?: ElementType<any>;
}
