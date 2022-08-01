/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from 'react';

import { BoxProps } from '@mui/material';
import { STagButton } from 'components/atoms/STagButton';
import { nodeTypesConstant } from 'components/organisms/main/Tree/OrgTree/constants/node-type.constant';
import {
  selectGhoIsSelected,
  selectGhoSearch,
} from 'store/reducers/hierarchy/ghoSlice';

import { characterizationMap } from 'core/constants/maps/characterization.map';
import { environmentMap } from 'core/constants/maps/environment.map';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IdsEnum } from 'core/enums/ids.enums';
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

  if (!gho) return null;
  if (!gho.name) return null;

  if (viewDataType == ViewsDataEnum.GSE && gho.type) {
    return null;
  }

  const getTopText = () => {
    if (viewDataType == ViewsDataEnum.GSE) return '';
    if (isHierarchy) return nodeTypesConstant[gho.type].name;

    if (gho.description) {
      const splitValues = gho.description.split('(//)');
      if (splitValues[1]) {
        if (viewDataType == ViewsDataEnum.ENVIRONMENT)
          if ((environmentMap as any)[splitValues[1]])
            return (environmentMap as any)[splitValues[1]]?.name;
        if (viewDataType == ViewsDataEnum.CHARACTERIZATION)
          if ((characterizationMap as any)[splitValues[1]])
            return (characterizationMap as any)[splitValues[1]]?.name;
      }
    }

    return;
  };

  const topText = getTopText();

  if (topText === undefined) return null;

  const searchName = Object.values(HomoTypeEnum).includes((gho as any).type)
    ? (gho as any).description.split('(//)')[0] + topText
    : gho.name;

  if (
    searchSelected &&
    !stringNormalize(searchName).includes(stringNormalize(searchSelected)) &&
    !isSelected
  )
    return null;

  const selected = {} as any;

  if (isSelected) {
    selected.sx = { '*': { color: 'white !important' }, minHeight: '100%' };
    selected.bg = 'success.main';
  }

  const getName = () => {
    if (isHierarchy) return gho.name;

    if (gho.description) {
      const splitValues = gho.description.split('(//)');
      if (splitValues[1]) {
        return splitValues[0];
      }
    }

    return gho.name;
  };

  const name = getName();

  return (
    <STagButton
      topText={topText}
      large
      text={name}
      id={IdsEnum.RISK_TOOL_GHO_HORIZONTAL.replace(
        ':id',
        gho.id.split('//')[0],
      )}
      tooltipTitle={(isHierarchy ? gho.parentsName + ' > ' : '') + name}
      sx={{ minHeight: '100%' }}
      {...selected}
      {...props}
    />
  );
};
