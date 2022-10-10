import { MouseEvent } from 'react';

export interface ISIconUpload {
  handleSelectMenu?: (option: any, e: MouseEvent<HTMLLIElement>) => void;
  disabled?: boolean;
  disabledUpload?: boolean;
  disabledDownload?: boolean;
  tooltipTitle?: string;
  text?: string;
  isTag?: boolean;
  loading?: boolean;
  isActive?: boolean;
  downloadPath?: string;
  companyId?: string;
  uploadPath?: string;
  payload?: any;
  onUpload?: (file: File) => void;
  onDownload?: () => void;
}
