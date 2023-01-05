/* eslint-disable @typescript-eslint/ban-types */
import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';
import { SButtonProps } from 'components/atoms/SButton/types';
import { SInputProps } from 'components/atoms/SInput/types';

export type STableButtonProps = Omit<SButtonProps, 'color'> & {
  addText?: ReactNode;
  icon?: any;
  color?: string;
  tooltip?: string;
};

export type STableSearchProps = SInputProps & {
  onAddClick?: () => void;
  addText?: ReactNode;
  onExportClick?: () => void;
  // onImportClick?: () => void;
  boxProps?: Partial<BoxProps>;
  icon?: any;
  color?: string;
  sm?: boolean;
};
