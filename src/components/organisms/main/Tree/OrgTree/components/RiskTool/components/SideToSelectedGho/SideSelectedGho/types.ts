import { IGho } from 'core/interfaces/api/IGho';

import { ViewsDataEnum } from '../../../utils/view-data-type.constant';
import { IHierarchyTreeMapObject } from '../../RiskToolViews/RiskToolRiskView/types';

export interface SideItemsProps {
  viewDataType: ViewsDataEnum;
  data: IGho | IHierarchyTreeMapObject;
}
