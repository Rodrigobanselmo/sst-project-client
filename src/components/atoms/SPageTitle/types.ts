/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, ReactNode } from 'react';

import { Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import { STextProps } from 'components/atoms/SText/types';

export interface SPageTitleProps extends STextProps {
  icon?: ElementType<any>;
  iconSx?: SxProps<Theme>;
  subtitle?: ReactNode;
}
