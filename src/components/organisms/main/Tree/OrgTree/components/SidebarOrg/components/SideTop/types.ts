/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

import { IViewsRiskOption, ViewTypeEnum } from '../../utils/view-type.constant';

export interface SideTopProps {
  riskInit?: boolean;
  viewType: ViewTypeEnum;
  onChangeView?: (option: IViewsRiskOption) => void;
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
