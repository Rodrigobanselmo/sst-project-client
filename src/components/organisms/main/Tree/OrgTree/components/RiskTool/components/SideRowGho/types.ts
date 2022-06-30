import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

import { IHierarchyTreeMapObject } from '../RiskToolViews/RiskToolRiskView/types';

export interface SideItemsProps {
  isSelected?: boolean;
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
