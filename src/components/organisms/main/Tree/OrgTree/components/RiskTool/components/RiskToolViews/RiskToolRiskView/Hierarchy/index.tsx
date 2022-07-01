import React, { FC, useMemo } from 'react';

import clone from 'clone';
import { TreeTypeEnum } from 'components/organisms/main/Tree/OrgTree/enums/tree-type.enums';
import { useRouter } from 'next/router';
import {
  selectGhoFilter,
  selectGhoId,
} from 'store/reducers/hierarchy/ghoSlice';
import { selectRisk } from 'store/reducers/hierarchy/riskAddSlice';

import { QueryEnum } from 'core/enums/query.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { useQueryRiskData } from 'core/services/hooks/queries/useQueryRiskData';
import { queryClient } from 'core/services/queryClient';
import { sortFilter } from 'core/utils/sorts/filter.sort';

import { useListHierarchy } from '../../../../hooks/useListHierarchy';
import { SideRow } from '../../../SideRow';
import { RiskToolRiskViewProps } from './types';

export const RiskToolRiskHierarchyView: FC<RiskToolRiskViewProps> = ({
  handleDeleteGHO,
  handleEditGHO,
  handleSelectGHO,
  isDeleteLoading,
}) => {
  const selectedGhoId = useAppSelector(selectGhoId);
  const selectedGhoFilter = useAppSelector(selectGhoFilter);

  const { companyId } = useGetCompanyId();

  const { query } = useRouter();
  const { hierarchyListData } = useListHierarchy();
  const isRiskOpen = useMemo(() => !!query.riskGroupId, [query]);

  const risk = useAppSelector(selectRisk);

  //! performance optimization here
  const { data: riskData } = useQueryRiskData(
    query.riskGroupId as string,
    risk?.id as string,
  );

  const hierarchyOrderedData = useMemo(() => {
    const hierarchyArray = hierarchyListData();

    if (!hierarchyArray) return [];
    if (!selectedGhoFilter.value || !selectedGhoFilter.key)
      return hierarchyArray;

    const riskData = queryClient.getQueryData([
      QueryEnum.RISK_DATA,
      companyId,
      query.riskGroupId,
      risk?.id,
    ]) as IRiskData[];

    if (!riskData) return hierarchyArray;
    if (riskData.length === 0) return hierarchyArray;

    const ghoData = hierarchyArray.map((gho) => {
      const riskDataFilters = riskData.map((rd) => {
        const copyItem = clone(rd) as Partial<IRiskData>;
        Object.entries(copyItem).map(([key, value]) => {
          if (Array.isArray(value)) (copyItem as any)[key] = value.length;
        });
        delete copyItem.id;

        return copyItem;
      });

      const foundRiskData = riskDataFilters.find((risk) =>
        gho.ghos.some((group) => risk.homogeneousGroupId == group.id),
      );

      return {
        ...foundRiskData,
        ...gho,
      };
    });

    return ghoData.sort((a, b) =>
      sortFilter(a, b, selectedGhoFilter.value, selectedGhoFilter.key),
    );
  }, [
    companyId,
    hierarchyListData,
    query.riskGroupId,
    risk?.id,
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
            gho={gho}
            handleEditGHO={handleEditGHO}
            handleSelectGHO={handleSelectGHO}
            handleDeleteGHO={handleDeleteGHO}
            selectedGhoId={selectedGhoId}
            isDeleteLoading={isDeleteLoading}
            isRiskOpen={isRiskOpen}
            riskData={riskData.find(
              (data) =>
                data.homogeneousGroupId == String(gho.id).split('//')[0],
            )}
            // riskData={riskData.find((data) =>
            //   gho.ghos.some((group) => data.homogeneousGroupId == group.id),
            // )}
          />
        );
      })}
    </>
  );
};
