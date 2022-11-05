/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';

import { ViewsDataEnum } from '../../utils/view-data-type.constant';
import { IHierarchyTreeMapObject } from '../RiskToolViews/RiskToolRiskView/types';

export interface SideRowProps {
  gho: IGho | IHierarchyTreeMapObject;
  isRiskOpen: boolean;
  isDeleteLoading: boolean;
  isRepresentAll?: boolean;
  selectedGhoId: string | null;
  riskGroupId: string;
  riskDataAll?: IRiskData[];
  riskData?: IRiskData;
  viewDataType: ViewsDataEnum;
  handleEditGHO: (data: any) => void;
  handleSelectGHO: (
    gho: any | null,
    hierarchies: string[],
  ) =>
    | {
        payload: Partial<IGhoState>;
        type: string;
      }
    | undefined;
  handleDeleteGHO: (id: string) => void;
}
