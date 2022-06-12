/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType } from 'react';

import { Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import { STextProps } from 'components/atoms/SText/types';

export interface STableTitleProps extends STextProps {
  icon?: ElementType<any>;
  iconSx?: SxProps<Theme>;
}
