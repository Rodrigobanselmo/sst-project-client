import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';

import { ViewsDataEnum } from '../../../utils/view-data-type.constant';
import { ViewTypeEnum } from '../../../utils/view-risk-type.constant';
import { IHierarchyTreeMapObject } from '../../RiskToolViews/RiskToolRiskView/types';

export interface SideSelectViewContentProps {
  ghoQuery: IGho[];
  viewType: ViewTypeEnum;
  loadingCopy?: boolean;
  viewDataType: ViewsDataEnum;
  inputRef: React.RefObject<HTMLInputElement>;
  handleAddGHO?: () => Promise<void>;
  handleEditGHO: (data: IGho) => void;
  handleCopyGHO: (data: IGho | IHierarchyTreeMapObject | IHierarchy) => void;
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
