import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';

import { ViewsDataEnum } from '../../utils/view-data-type.constant';
import { IHierarchyTreeMapObject } from '../RiskToolViews/RiskToolRiskView/types';

export interface SideItemsProps {
  isSelected?: boolean;
  viewDataType: ViewsDataEnum;
  riskData?: IRiskData;
  hide?: boolean;
  data: IGho | IHierarchyTreeMapObject;
  isDeleteLoading?: boolean;
  handleEditGHO: (data: IGho | IHierarchyTreeMapObject) => void;
  handleDeleteGHO: (id: string, data?: IGho | IHierarchyTreeMapObject) => void;
  handleSelectGHO: (
    data: IGho | null,
    hierarchies: string[],
  ) =>
    | {
        payload: Partial<IGhoState>;
        type: string;
      }
    | undefined;
}
