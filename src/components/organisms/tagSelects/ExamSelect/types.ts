import { BoxProps } from '@mui/material';
import { ISTagSearchSelectProps } from 'components/molecules/STagSearchSelect/types';
import { RiskEnum } from 'project/enum/risk.enums';

import { IExam } from 'core/interfaces/api/IExam';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { IQueryExam } from 'core/services/hooks/queries/useQueryExams/useQueryExams';

export interface IExamSelectProps
  extends BoxProps,
    Partial<ISTagSearchSelectProps> {
  text?: string;
  tooltipTitle?: string;
  borderActive?: 'error' | 'info' | 'warning' | 'success';
  large?: boolean;
  selected?: (string | number)[];
  multiple?: boolean;
  handleSelect?: (selectedIds: IExam) => void;
  onEnter?: (value: string) => void;
  onlyExam?: boolean;
  query?: IQueryExam;
  /** Quando definido, o tag não exibe spinner de catálogo enquanto busca opções. */
  selectedExamId?: number;
  /**
   * Categoria do risco em contexto. Quando definida, a lista prioriza exames
   * compatíveis com o risco e exibe a opção "Mostrar todos os exames".
   */
  riskType?: RiskEnum;
  /** Risco completo em contexto (matriz de caracterização). Necessário para exibir
   * grau quantitativo mínimo quando aplicável. */
  risk?: IRiskFactors;
}
