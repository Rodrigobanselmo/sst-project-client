import { BoxProps } from '@mui/material';
import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

export interface IRecMedSelectProps
  extends BoxProps,
    Partial<ISTagSearchSelectProps> {
  riskIds: (string | number)[];
  selectedMed: (string | number)[];
  text?: string;
  large?: boolean;
  multiple?: boolean;
  risk?: IRiskFactors;
  handleSelect?: (selectedIds: string[]) => void;
  onEnter?: (value: string) => void;
}
