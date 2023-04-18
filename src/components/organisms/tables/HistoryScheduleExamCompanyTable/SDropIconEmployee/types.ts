import { MouseEvent } from 'react';

import { ICompany } from 'core/interfaces/api/ICompany';
import { IEmployee } from 'core/interfaces/api/IEmployee';

export interface ISIconUpload {
  disabled?: boolean;
  tooltipTitle?: string;
  text?: string;
  isTag?: boolean;
  isMenu?: boolean;
  loading?: boolean;
  employee?: IEmployee;
  isScheduled?: boolean;
  isAvaliation?: boolean;
  asoId?: number;
  onReSchedule: () => void;
  handleSelectMenu?: (option: any, e: MouseEvent<HTMLLIElement>) => void;
  onEditEmployee: (employee: IEmployee) => void;
}
