/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, ElementType } from 'react';

import { BoxProps } from '@mui/material';

import { ITagAction } from '../../../../atoms/STagAction/types';

export interface SModalHeaderProps extends Omit<BoxProps, 'title'> {
  title: string | ReactNode;
  icon?: ReactNode;
  modalName?: string;
  tag?: ITagAction;
  subtitle?: string;
  onClose: () => void;
  secondIcon?: ElementType<any>;
  secondIconClick?: () => void;
}
