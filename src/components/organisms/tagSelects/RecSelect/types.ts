import { BoxProps } from '@mui/material';
import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';
import { RecTypeEnum } from 'project/enum/recType.enum';

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
  type?: RecTypeEnum;
  handleSelect?: (selectedIds: string[] | IRecMed) => void;
  onEnter?: (value: string) => void;
  onCreate?: (value: IRecMed | null) => void;
  onlyInput?: 'adm' | 'eng' | 'rec' | '';
}
