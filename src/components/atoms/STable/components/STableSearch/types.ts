import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';
import { SButtonProps } from 'components/atoms/SButton/types';
import { SInputProps } from 'components/atoms/SInput/types';

import { IFilterIconProps } from '../STableFilter/STableFilterIcon/types';

export type STableButtonProps = Omit<SButtonProps, 'color'> & {
  addText?: ReactNode;
  icon?: any;
  color?: string;
  tooltip?: string;
};

export type STableSearchProps = SInputProps & {
  onAddClick?: () => void;
  addText?: ReactNode;
  filterProps?: IFilterIconProps;
  onExportClick?: () => void;
  onImportClick?: () => void;
  onReloadClick?: () => void;
  loadingReload?: boolean;
  // onImportClick?: () => void;
  boxProps?: Partial<BoxProps>;
  icon?: any;
  color?: string;
  sm?: boolean;
};
