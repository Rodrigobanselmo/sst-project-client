import { MouseEvent } from 'react';

export interface ISIconUpload {
  handleSelectMenu?: (option: any, e: MouseEvent<HTMLLIElement>) => void;
  disabled?: boolean;
  missingDoctor?: boolean;
  tooltipTitle?: string;
  text?: string;
  isTag?: boolean;
  isMenu?: boolean;
  loading?: boolean;
  isActive?: boolean;
  companyId?: string;
  employeeId?: number;
  asoId?: number;
}
