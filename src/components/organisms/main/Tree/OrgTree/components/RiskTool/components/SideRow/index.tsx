/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { selectGhoSearch } from 'store/reducers/hierarchy/ghoSlice';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useObserverHide } from 'core/hooks/useObserverHide';
import { IGho } from 'core/interfaces/api/IGho';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { TreeTypeEnum } from '../../../../enums/tree-type.enums';
import { IHierarchyTreeMapObject } from '../RiskToolViews/RiskToolRiskView/types';
import { SideRowGho } from '../SideRowGho';
import { SideRowTable } from '../SideRowTable/SingleGho';
import { SideRowProps } from './types';

const getGhoName = (
  gho: IGho | IHierarchyTreeMapObject,
  hierarchyName = '',
) => {
  if (!gho?.type) return gho.name;
  if (
    gho.type == HomoTypeEnum.HIERARCHY ||
    Object.values(TreeTypeEnum).includes((gho as any).type)
  )
    return hierarchyName;

  if (gho.description) {
    const splitValues = gho.description.split('(//)');
    return splitValues[0];
  }

  return '';
};

export const SideRow = React.memo<SideRowProps>(
  ({
    handleDeleteGHO,
    handleSelectGHO,
    handleEditGHO,
    selectedGhoId,
    gho,
    isRiskOpen,
    isDeleteLoading,
    riskData,
    viewDataType,
    riskGroupId,
    isRepresentAll,
    riskDataAll,
  }) => {
    const isSelected = selectedGhoId === gho.id;
    const { hide, ref } = useObserverHide();
    const searchSelected = useAppSelector(selectGhoSearch);

    if (!riskData && 'riskData' in gho) riskData = gho.riskData;

    const isToFilter =
      searchSelected &&
      !stringNormalize(getGhoName(gho, gho?.name)).includes(
        stringNormalize(searchSelected),
      );

    return (
      <SFlex
        key={gho.id}
        ref={ref}
        sx={{
          gridTemplateColumns: '285px 1fr',
          display: isToFilter ? 'none' : 'grid',
        }}
        gap={5}
      >
        <SideRowGho
          data={gho}
          viewDataType={viewDataType}
          isSelected={isSelected}
          handleEditGHO={handleEditGHO}
          handleSelectGHO={handleSelectGHO}
          handleDeleteGHO={handleDeleteGHO}
          isDeleteLoading={isDeleteLoading}
          hide={hide}
          riskData={riskData}
        />
        <SFlex gap={4} direction="column">
          {isRiskOpen &&
            (!riskDataAll?.length ||
              !!riskDataAll?.every((r) => r.endDate)) && (
              <SideRowTable
                isSelected={isSelected}
                hide={hide}
                gho={gho}
                riskData={
                  riskDataAll?.every((r) => r.endDate) ? undefined : riskData
                }
                riskGroupId={riskGroupId}
                isRepresentAll={isRepresentAll}
              />
            )}
          {isRiskOpen &&
            !!riskDataAll?.length &&
            riskDataAll?.map((rd) => {
              return (
                <SideRowTable
                  key={rd.id}
                  isSelected={isSelected}
                  hide={hide}
                  gho={gho}
                  riskData={rd}
                  riskGroupId={riskGroupId}
                  isRepresentAll={isRepresentAll}
                  handleDeleteRiskData={(id, gho) =>
                    handleDeleteGHO(id, {
                      ...gho,
                      name: !gho?.description?.split('(//)')?.[1]
                        ? gho?.name || ''
                        : gho?.description?.split('(//)')?.[0] || '',
                    })
                  }
                  isDeleteLoading={isDeleteLoading}
                />
              );
            })}
        </SFlex>
      </SFlex>
    );
  },
);
