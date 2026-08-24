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
  handleSelect?: (selectedIds: string[] | IRecMed | IRecMed[]) => void;
  onEnter?: (value: string) => void;
  onCreate?: (value: IRecMed | null) => void;
  onlyInput?: 'adm' | 'eng' | 'rec' | '';
  /** RiskTool only: mostra recType, permite classificar e filtrar a lista. */
  enableRecTypeQuickClassify?: boolean;
  /**
   * RiskTool V2 only: no CONFIRMAR do multi-select, devolve IRecMed[]
   * (com recType) em vez de string[]. Checklist e demais usos não passam.
   */
  resolveMultipleAsItems?: boolean;
}
