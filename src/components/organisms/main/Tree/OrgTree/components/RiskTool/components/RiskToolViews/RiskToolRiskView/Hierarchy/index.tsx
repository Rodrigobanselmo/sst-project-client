import React, { FC, useMemo } from 'react';

import { TreeTypeEnum } from 'components/organisms/main/Tree/OrgTree/enums/tree-type.enums';
import { useRouter } from 'next/router';
import {
  selectGhoFilter,
  selectGhoId,
} from 'store/reducers/hierarchy/ghoSlice';
import { selectRisk } from 'store/reducers/hierarchy/riskAddSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useQueryRiskData } from 'core/services/hooks/queries/useQueryRiskData';
import { sortFilter } from 'core/utils/sorts/filter.sort';

import { useListHierarchy } from '../../../../hooks/useListHierarchy';
import { SideRow } from '../../../SideRow';
import { RiskToolRiskViewProps } from './types';

export const RiskToolRiskHierarchyView: FC<RiskToolRiskViewProps> = ({
  handleDeleteGHO,
  handleEditGHO,
  handleSelectGHO,
  isDeleteLoading,
  viewDataType,
  isRiskOpen,
  riskGroupId,
}) => {
  const selectedGhoId = useAppSelector(selectGhoId);
  const selectedGhoFilter = useAppSelector(selectGhoFilter);

  const { hierarchyListData } = useListHierarchy();

  const risk = useAppSelector(selectRisk);

  //! performance optimization here
  const { data: riskData } = useQueryRiskData(
    riskGroupId as string,
    risk?.id as string,
  );

  const hierarchyOrderedData = useMemo(() => {
    const hierarchyArray = hierarchyListData();
    if (!hierarchyArray) return [];
    if (!riskData) return hierarchyArray;
    if (riskData.length === 0) return hierarchyArray;

    const ghoData = hierarchyArray.map((gho) => {
      const foundRiskData = riskData.find(
        (data) => data.homogeneousGroupId == String(gho.id).split('//')[0],
      );

      return {
        ...gho,
        riskData: foundRiskData,
      };
    });

    if (!selectedGhoFilter.value || !selectedGhoFilter.key) return ghoData;

    return ghoData.sort((a, b) =>
      sortFilter(
        a.riskData || {},
        b.riskData || {},
        selectedGhoFilter.value,
        selectedGhoFilter.key,
      ),
    );
  }, [
    hierarchyListData,
    riskData,
    selectedGhoFilter.key,
    selectedGhoFilter.value,
  ]);

  return (
    <>
      {hierarchyOrderedData.map((gho) => {
        if ([TreeTypeEnum.COMPANY, TreeTypeEnum.WORKSPACE].includes(gho.type))
          return null;

        return (
          <SideRow
            key={gho.id}
            viewDataType={viewDataType}
            gho={gho}
            handleEditGHO={handleEditGHO}
            handleSelectGHO={handleSelectGHO}
            handleDeleteGHO={handleDeleteGHO}
            selectedGhoId={selectedGhoId}
            isDeleteLoading={isDeleteLoading}
            isRiskOpen={isRiskOpen}
            riskData={(gho as any).riskData}
            riskGroupId={riskGroupId}
            // riskData={riskData.find((data) =>
            //   gho.ghos.some((group) => data.homogeneousGroupId == group.id),
            // )}
          />
        );
      })}
    </>
  );
};
