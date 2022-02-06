import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

import { ITagAction } from '../../../../atoms/STag/types';

export interface SModalHeaderProps extends Omit<BoxProps, 'title'> {
  title: string | ReactNode;
  modalName: string;
  tag?: ITagAction;
  subtitle?: string;
  onClose?: () => void;
}
