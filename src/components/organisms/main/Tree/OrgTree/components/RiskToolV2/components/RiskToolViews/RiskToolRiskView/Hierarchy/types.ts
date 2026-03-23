/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

import { ViewsDataEnum } from '../../../../utils/view-data-type.constant';
import { IHierarchyTreeMapObject } from '../types';

export interface RiskToolRiskViewProps {
  isRiskOpen: boolean;
  isDeleteLoading: boolean;
  riskGroupId: string;
  viewDataType: ViewsDataEnum;
  selectedGhoId: string | null;
  handleEditGHO: (data: IGho | IHierarchyTreeMapObject) => void;
  handleSelectGHO: (
    gho: IGho | null,
    hierarchies: string[],
  ) =>
    | {
        payload: Partial<IGhoState>;
        type: string;
      }
    | undefined;
  handleDeleteGHO: (id: string) => void;
}
