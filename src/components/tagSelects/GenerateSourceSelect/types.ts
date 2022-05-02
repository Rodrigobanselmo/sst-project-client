import { BoxProps } from '@mui/material';
import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';

import {
  IGenerateSource,
  IRiskFactors,
} from 'core/interfaces/api/IRiskFactors';

export interface IGenerateSourceSelectProps
  extends BoxProps,
    Partial<ISTagSearchSelectProps> {
  riskIds: (string | number)[];
  selectedGS?: (string | number)[];
  text?: string;
  tooltipTitle?: string;
  large?: boolean;
  multiple?: boolean;
  risk?: IRiskFactors;
  onlyFromActualRisks?: boolean;
  handleSelect?: (selectedIds: string[] | IGenerateSource) => void;
  onEnter?: (value: string) => void;
}
