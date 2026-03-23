import { IGho } from 'core/interfaces/api/IGho';

import { ViewsDataEnum } from '../../../utils/view-data-type.constant';
import { IHierarchyTreeMapObject } from '../../RiskToolViews/RiskToolRiskView/types';

export interface SideItemsProps {
  isSelected?: boolean;
  isEndSelect?: boolean;
  viewDataType: ViewsDataEnum;
  data: IGho | IHierarchyTreeMapObject;
  handleSelect: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleEndSelect?: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
}
