import { MouseEvent } from 'react';

import { ICompany } from 'core/interfaces/api/ICompany';
import {
  IEmployee,
  IEmployeeExamsHistory,
} from 'core/interfaces/api/IEmployee';

export interface ISIconUpload {
  disabled?: boolean;
  tooltipTitle?: string;
  text?: string;
  isTag?: boolean;
  isMenu?: boolean;
  loading?: boolean;
  skipOS?: boolean;
  skipGuia?: boolean;
  /** Quando true, exibe “Excluir funcionário” (soft delete). Apenas na tabela principal de Funcionários. */
  enableSoftDelete?: boolean;
  employee: IEmployee;
  company: ICompany;
  isScheduled?: boolean;
  isExpired?: boolean;
  canSchedule?: boolean;
  handleSelectMenu?: (option: any, e: MouseEvent<HTMLLIElement>) => void;
  onEditEmployee: (employee: IEmployee) => void;
  exam?: IEmployeeExamsHistory;
}
