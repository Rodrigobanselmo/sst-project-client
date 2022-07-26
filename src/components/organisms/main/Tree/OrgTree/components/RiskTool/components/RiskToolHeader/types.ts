/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

import { ViewsDataEnum } from '../../utils/view-data-type.constant';
import { ViewTypeEnum } from '../../utils/view-risk-type.constant';
import { IHierarchyTreeMapObject } from '../RiskToolViews/RiskToolRiskView/types';

export interface SideHeaderProps {
  isAddLoading?: boolean;
  riskInit?: boolean;
  loadingCopy?: boolean;
  ghoQuery: IGho[];
  inputRef: any;
  viewDataType: ViewsDataEnum;
  viewType: ViewTypeEnum;
  handleCopyGHO: (data: IGho | IHierarchyTreeMapObject) => void;
  handleAddGHO: () => Promise<void>;
  handleEditGHO: (data: IGho) => void;
  handleSelectGHO: (
    gho: IGho | null,
    hierarchies: string[],
  ) =>
    | {
        payload: Partial<IGhoState>;
        type: string;
      }
    | undefined;
}
