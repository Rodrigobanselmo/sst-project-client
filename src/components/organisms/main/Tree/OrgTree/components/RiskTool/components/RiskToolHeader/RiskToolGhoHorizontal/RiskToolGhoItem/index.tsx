/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { BoxProps } from '@mui/material';
import { STagButton } from 'components/atoms/STagButton';
import { nodeTypesConstant } from 'components/organisms/main/Tree/OrgTree/constants/node-type.constant';
import {
  selectGhoIsSelected,
  selectGhoSearch,
} from 'store/reducers/hierarchy/ghoSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { IGho } from 'core/interfaces/api/IGho';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { ViewsDataEnum } from '../../../../utils/view-data-type.constant';
import { IHierarchyTreeMapObject } from '../../../RiskToolViews/RiskToolRiskView/types';

export const RiskToolGhoItem: FC<
  BoxProps & {
    gho: IGho | IHierarchyTreeMapObject;
    viewDataType: ViewsDataEnum;
  }
> = ({ gho, viewDataType, ...props }) => {
  const isSelected = useAppSelector(selectGhoIsSelected(gho.id));
  const searchSelected = useAppSelector(selectGhoSearch);
  const isHierarchy = 'childrenIds' in gho;

  if (viewDataType == ViewsDataEnum.GSE && gho.type) {
    return null;
  }

  if (
    searchSelected &&
    !stringNormalize(gho.name).includes(stringNormalize(searchSelected)) &&
    !isSelected
  )
    return null;

  const selected = {} as any;

  if (isSelected) {
    selected.sx = { '*': { color: 'white !important' } };
    selected.bg = 'success.main';
  }

  return (
    <STagButton
      topText={isHierarchy ? nodeTypesConstant[gho.type].name : undefined}
      subText={isHierarchy ? gho.parentsName : undefined}
      large
      text={gho.name}
      {...selected}
      {...props}
    />
  );
};
