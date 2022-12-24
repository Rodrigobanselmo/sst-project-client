import React, { useEffect } from 'react';

import { initialRiskToolState } from 'components/organisms/modals/ModalRiskTool/hooks/useModalRiskTool';
import {
  setGhoFilterValues,
  setGhoState,
} from 'store/reducers/hierarchy/ghoSlice';
import { setRiskAddState } from 'store/reducers/hierarchy/riskAddSlice';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { useModal } from 'core/hooks/useModal';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { ViewsDataEnum } from '../utils/view-data-type.constant';
import { ViewTypeEnum } from '../utils/view-risk-type.constant';

export interface IOpenSelected {
  viewData?: ViewsDataEnum;
  viewType?: ViewTypeEnum;
  ghoId: string;
  ghoName: string;
  risks?: IRiskFactors[];
  filterKey?: string;
  filterValue?: string;
}

export const useOpenRiskTool = () => {
  const dispatch = useAppDispatch();
  const { onStackOpenModal } = useModal();

  const onOpenSelected = ({
    viewData = ViewsDataEnum.HIERARCHY,
    viewType = ViewTypeEnum.SIMPLE_BY_GROUP,
    ghoId,
    ghoName,
    risks,
    filterKey,
    filterValue,
  }: IOpenSelected) => {
    dispatch(
      setRiskAddState({
        viewType,
        viewData,
        isEdited: false,
        ...(risks && {
          risk: risks[0],
          risks: risks,
        }),
      }),
    );
    dispatch(
      setGhoFilterValues({
        key: '',
        values: [],
        ...(filterKey &&
          filterValue && {
            key: filterKey,
            values: [filterValue],
          }),
      }),
    );

    if (ghoId) {
      setTimeout(() => {
        // document
        //   .getElementById(
        //     IdsEnum.RISK_TOOL_GHO_HORIZONTAL.replace(':id', ghoId || ''),
        //   )
        //   ?.click();

        document
          .getElementById(IdsEnum.RISK_TOOL_GHO_INPUT_SEARCH)
          ?.setAttribute('value', ghoName || '');

        dispatch(
          setGhoState({
            search: ghoName,
            searchSelect: '',
            searchRisk: '',
            selected: {
              name: ghoName,
              id: ghoId,
              description: ghoName,
              type: '',
              ...(viewData == ViewsDataEnum.HIERARCHY && { childrenIds: [] }),
            } as any,
          }),
        );
      }, 200);
    }
  };

  const onOpenRiskToolSelected = ({
    homogeneousGroup,
    riskFactor,
    hierarchyName,
    riskGroupId,
  }: {
    homogeneousGroup: IGho | undefined;
    riskFactor: IRiskFactors;
    hierarchyName?: string;
    riskGroupId?: string;
  }) => {
    const foundGho = homogeneousGroup;

    let viewData = ViewsDataEnum.CHARACTERIZATION;
    let ghoName = foundGho?.name;

    switch (foundGho?.type) {
      case HomoTypeEnum.HIERARCHY:
        viewData = ViewsDataEnum.HIERARCHY;
        ghoName = hierarchyName || foundGho?.hierarchy?.name;
        break;
      case (HomoTypeEnum.GSE, undefined, null):
        viewData = ViewsDataEnum.GSE;
        ghoName = foundGho?.name;
        break;
      case HomoTypeEnum.ENVIRONMENT:
        viewData = ViewsDataEnum.ENVIRONMENT;
        ghoName = foundGho?.description?.split('(//)')[0];
        break;

      default:
        viewData = ViewsDataEnum.CHARACTERIZATION;
        ghoName = foundGho?.description?.split('(//)')[0];
        break;
    }

    if (foundGho)
      setTimeout(() => {
        onOpenSelected({
          viewData,
          viewType: ViewTypeEnum.SIMPLE_BY_RISK,
          ghoId: foundGho.id,
          ghoName: ghoName || '',
          risks: [riskFactor],
          filterKey: 'probability',
          filterValue: 'desc',
        });
      }, 500);

    onStackOpenModal(ModalEnum.RISK_TOOL, { riskGroupId } as Partial<
      typeof initialRiskToolState
    >);
  };

  return { onOpenSelected, onOpenRiskToolSelected, onStackOpenModal };
};
