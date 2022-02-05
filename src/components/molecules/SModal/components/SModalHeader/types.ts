import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

export interface SModalHeaderProps extends Omit<BoxProps, 'title'> {
  title: string | ReactNode;
  modalName: string;
  subtitle?: string;
  onClose?: () => null;
}
