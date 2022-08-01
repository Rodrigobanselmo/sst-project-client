import {
  setGhoFilterValues,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import { setRiskAddState } from 'store/reducers/hierarchy/riskAddSlice';

import { IdsEnum } from 'core/enums/ids.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';

import { ViewsDataEnum } from '../utils/view-data-type.constant';
import { ViewTypeEnum } from '../utils/view-risk-type.constant';

export interface IOpenSelected {
  viewData?: ViewsDataEnum;
  viewType?: ViewTypeEnum;
  ghoId: string;
  ghoName: string;
}

export const useOpenRiskTool = () => {
  const dispatch = useAppDispatch();

  const onOpenSelected = ({
    viewData = ViewsDataEnum.HIERARCHY,
    viewType = ViewTypeEnum.SIMPLE_BY_GROUP,
    ghoId,
    ghoName,
  }: IOpenSelected) => {
    dispatch(
      setRiskAddState({
        viewData,
        isEdited: false,
      }),
    );
    dispatch(
      setGhoFilterValues({
        key: '',
        values: [],
      }),
    );
    dispatch(
      setRiskAddState({
        viewType,
        isEdited: false,
      }),
    );

    if (ghoId) {
      setTimeout(() => {
        document
          .getElementById(
            IdsEnum.RISK_TOOL_GHO_HORIZONTAL.replace(':id', ghoId || ''),
          )
          ?.click();

        document
          .getElementById(IdsEnum.RISK_TOOL_GHO_INPUT_SEARCH)
          ?.setAttribute('value', ghoName || '');

        dispatch(
          setGhoState({
            search: ghoName,
            searchSelect: '',
            searchRisk: '',
          }),
        );
      }, 100);
    }
  };

  return { onOpenSelected };
};
