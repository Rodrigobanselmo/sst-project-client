import React, { FC, useMemo } from 'react';

import clone from 'clone';
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
import { useQueryGHO } from 'core/services/hooks/queries/useQueryGHO';
import { useQueryRiskData } from 'core/services/hooks/queries/useQueryRiskData';
import { queryClient } from 'core/services/queryClient';
import { sortFilter } from 'core/utils/sorts/filter.sort';

import { SideRow } from '../../../SideRow';
import { RiskToolRiskViewProps } from './types';

export const RiskToolRiskGhoView: FC<RiskToolRiskViewProps> = ({
  handleDeleteGHO,
  handleEditGHO,
  handleSelectGHO,
  isDeleteLoading,
}) => {
  const { data: ghoQuery } = useQueryGHO();
  const selectedGhoId = useAppSelector(selectGhoId);
  const selectedGhoFilter = useAppSelector(selectGhoFilter);

  const { companyId } = useGetCompanyId();

  const { query } = useRouter();
  const isRiskOpen = useMemo(() => !!query.riskGroupId, [query]);

  const risk = useAppSelector(selectRisk);

  //! performance optimization here
  const { data: riskData } = useQueryRiskData(
    query.riskGroupId as string,
    risk?.id as string,
  );

  const ghoOrderedData = useMemo(() => {
    if (!ghoQuery) return [];
    if (!selectedGhoFilter.value || !selectedGhoFilter.key) return ghoQuery;
    const riskData = queryClient.getQueryData([
      QueryEnum.RISK_DATA,
      companyId,
      query.riskGroupId,
      risk?.id,
    ]) as IRiskData[];

    if (!riskData) return ghoQuery;
    if (riskData.length === 0) return ghoQuery;

    const ghoData = ghoQuery.map((gho) => {
      const riskDataFilters = riskData.map((rd) => {
        const copyItem = clone(rd) as Partial<IRiskData>;
        Object.entries(copyItem).map(([key, value]) => {
          if (Array.isArray(value)) (copyItem as any)[key] = value.length;
        });
        delete copyItem.id;

        return copyItem;
      });

      const foundRiskData = riskDataFilters.find(
        (risk) => risk.homogeneousGroupId === gho.id,
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
    ghoQuery,
    query.riskGroupId,
    risk?.id,
    selectedGhoFilter.key,
    selectedGhoFilter.value,
  ]);

  return (
    <>
      {ghoOrderedData.map((gho) => {
        if (gho.type) return;
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
              (data) => data.homogeneousGroupId == gho.id,
            )}
          />
        );
      })}
    </>
  );
};

//  <Slide
//     direction="left"
//     in={isGhoOpen || isRiskOpen}
//     mountOnEnter
//     unmountOnExit
//   ></Slide>
