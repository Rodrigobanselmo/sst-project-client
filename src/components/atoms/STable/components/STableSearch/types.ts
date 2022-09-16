/* eslint-disable @typescript-eslint/ban-types */
import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';
import { SInputProps } from 'components/atoms/SInput/types';

export type STableSearchProps = SInputProps & {
  onAddClick?: () => void;
  addText?: ReactNode;
  onExportClick?: () => void;
  boxProps?: Partial<BoxProps>;
};
