import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';

export interface SideTableProps {
  isSelected?: boolean;
  gho: IGho;
  riskData?: IRiskData;
}
