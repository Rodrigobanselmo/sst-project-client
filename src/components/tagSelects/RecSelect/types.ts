import { BoxProps } from '@mui/material';
import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';

import { IRecMed, IRiskFactors } from 'core/interfaces/api/IRiskFactors';

export interface IRecMedSelectProps
  extends BoxProps,
    Partial<ISTagSearchSelectProps> {
  riskIds: (string | number)[];
  selectedRec?: (string | number)[];
  text?: string;
  large?: boolean;
  risk?: IRiskFactors;
  multiple?: boolean;
  onlyFromActualRisks?: boolean;
  handleSelect?: (selectedIds: string[] | IRecMed) => void;
  onEnter?: (value: string) => void;
}
