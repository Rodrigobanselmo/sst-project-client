import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';

import { IHierarchyTreeMapObject } from '../../RiskToolViews/RiskToolRiskView/types';

export interface SideTableProps {
  isSelected?: boolean;
  gho: IGho | IHierarchyTreeMapObject;
  riskData?: IRiskData;
  hide?: boolean;
  riskGroupId: string;
}
