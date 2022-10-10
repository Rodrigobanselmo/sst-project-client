import { MouseEvent } from 'react';

export interface ISIconUpload {
  handleSelectMenu?: (option: any, e: MouseEvent<HTMLLIElement>) => void;
  disabled?: boolean;
  tooltipTitle?: string;
  text?: string;
  isTag?: boolean;
  loading?: boolean;
  isActive?: boolean;
  companyId?: string;
  employeeId?: number;
}
