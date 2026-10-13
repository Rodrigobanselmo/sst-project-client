import { BoxProps } from '@mui/material';
import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';
import { MedTypeEnum } from 'project/enum/medType.enum';

import { IRecMed, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IRiskDataRec, IRiskDataRecDerivedMeasureRead } from 'core/interfaces/api/IRiskData';

export interface IRecMedSelectProps
  extends BoxProps,
    Partial<ISTagSearchSelectProps> {
  riskIds: (string | number)[];
  selectedMed?: (string | number)[];
  text?: string;
  large?: boolean;
  multiple?: boolean;
  risk?: IRiskFactors;
  handleSelect?: (selected: IRecMed | string[]) => void;
  type?: MedTypeEnum;
  onEnter?: (value: string) => void;
  onlyFromActualRisks?: boolean;
  onCreate?: (value: IRecMed | null) => void;
  onlyInput?: 'adm' | 'eng' | 'rec' | '';
  onlyEpi?: boolean;
  /**
   * Ids de controle com correspondência no fator aberto. O mesmo cadastro em
   * outro fator não entra nesta lista.
   */
  existingControlLinkedIds?: string[];
  /** Recomendações do fator aberto, com origem. */
  factorRecs?: Array<IRecMed | null | undefined> | null;
  factorDataRecs?: Array<IRiskDataRec | null | undefined> | null;
  factorDerivedMeasures?: Array<IRiskDataRecDerivedMeasureRead | null | undefined> | null;
  planWorkspaceId?: string;
}
