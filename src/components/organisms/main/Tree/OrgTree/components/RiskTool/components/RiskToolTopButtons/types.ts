/* eslint-disable @typescript-eslint/no-explicit-any */
import { IGhoState } from 'store/reducers/hierarchy/ghoSlice';

import { IGho } from 'core/interfaces/api/IGho';

import {
  IViewsDataOption,
  ViewsDataEnum,
} from '../../utils/view-data-type.constant';
import {
  IViewsRiskOption,
  ViewTypeEnum,
} from '../../utils/view-risk-type.constant';

export interface SideTopProps {
  riskInit?: boolean;
  viewType: ViewTypeEnum;
  viewDataType: ViewsDataEnum;
  onChangeView?: (option: IViewsRiskOption) => void;
  onChangeViewData?: (option: IViewsDataOption) => void;
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
