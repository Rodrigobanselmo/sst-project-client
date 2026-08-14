import { ReactNode } from 'react';

import { BoxProps, MenuProps } from '@mui/material';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

export interface ITypeSelectProps extends BoxProps {
  selectedRiskIds?: (string | number)[];
  large?: boolean;
  multiple?: boolean;
  handleSelect?: (selectedIds: (string | number)[] | IRiskFactors) => void;
  text?: string;
  active?: boolean;
  disabled?: boolean;
  error?: boolean;
  bg?: string;
  borderActive?: 'error' | 'info' | 'warning' | 'success';
  tooltipTitle?: ReactNode;
  representAll?: boolean;
  menuProps?: Partial<Omit<MenuProps, 'open' | 'onClose' | 'anchorEl'>>;
}
