import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

export interface ITypeSelectProps extends BoxProps {
  selectedRiskIds?: (string | number)[];
  large?: boolean;
  multiple?: boolean;
  handleSelect?: (selectedIds: (string | number)[] | IRiskFactors) => void;
  text?: string;
  active?: boolean;
  bg?: string;
  tooltipTitle?: ReactNode;
}
