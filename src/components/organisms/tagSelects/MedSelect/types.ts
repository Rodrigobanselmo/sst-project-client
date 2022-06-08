import { BoxProps } from '@mui/material';
import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';
import { MedTypeEnum } from 'project/enum/medType.enum';

import { IRecMed, IRiskFactors } from 'core/interfaces/api/IRiskFactors';

export interface IRecMedSelectProps
  extends BoxProps,
    Partial<ISTagSearchSelectProps> {
  riskIds: (string | number)[];
  selectedMed?: (string | number)[];
  text?: string;
  large?: boolean;
  multiple?: boolean;
  risk?: IRiskFactors;
  handleSelect?: (selectedIds: string[] | IRecMed) => void;
  type?: MedTypeEnum;
  onEnter?: (value: string) => void;
  onlyFromActualRisks?: boolean;
  onCreate?: (value: IRecMed | null) => void;
  onlyInput?: 'adm' | 'eng' | 'rec' | '';
}
