import { IGho } from 'core/interfaces/api/IGho';

import { IHierarchyTreeMapObject } from '../../RiskToolViews/RiskToolRiskView/types';

export interface SideItemsProps {
  isSelected?: boolean;
  isEndSelect?: boolean;
  data: IGho | IHierarchyTreeMapObject;
  handleSelect: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleEndSelect?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
}
