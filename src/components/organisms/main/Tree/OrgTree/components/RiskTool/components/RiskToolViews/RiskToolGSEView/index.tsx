import React, { FC, useMemo } from 'react';

import { useRouter } from 'next/router';
import { RiskOrderEnum } from 'project/enum/risk.enums';
import { selectGhoFilter } from 'store/reducers/hierarchy/ghoSlice';

import { QueryEnum } from 'core/enums/query.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { queryClient } from 'core/services/queryClient';
import { sortFilter } from 'core/utils/sorts/filter.sort';
import { sortNumber } from 'core/utils/sorts/number.sort';
import { sortString } from 'core/utils/sorts/string.sort';

import { RiskToolGSEViewRow } from './Row';
import { RiskToolGSEViewProps } from './types';

export const RiskToolGSEView: FC<RiskToolGSEViewProps> = () => {
  const selectedGhoFilter = useAppSelector(selectGhoFilter);

  const { companyId } = useGetCompanyId();

  const { query } = useRouter();

  const gho = useAppSelector((state) => state.gho.selected);

  //! performance optimization here
  const { data: riskDataQuery } = useQueryRiskDataByGho(
    query.riskGroupId as string,
    gho?.id as string,
  );

  const riskOrderedData = useMemo(() => {
    if (!riskDataQuery) return [];

    const risk = queryClient.getQueryData([
      QueryEnum.RISK,
      companyId,
    ]) as IRiskFactors[];

    if (!risk) return [];

    const data = riskDataQuery
      .sort(
        (a, b) =>
          sortFilter(a, b, selectedGhoFilter.value, selectedGhoFilter.key), //! performance optimization here nor sort
      )
      .map((riskData) => {
        return [riskData, risk.find((r) => r.id === riskData.riskId)] as [
          IRiskData,
          IRiskFactors,
        ];
      })
      .filter(([, r]) => r);

    if (!selectedGhoFilter.value && !selectedGhoFilter.key)
      return data
        .sort(([, a], [, b]) => sortString(a, b, 'name'))
        .sort(([, a], [, b]) =>
          sortNumber(RiskOrderEnum[a.type], RiskOrderEnum[b.type]),
        );

    return data;
  }, [
    companyId,
    riskDataQuery,
    selectedGhoFilter.key,
    selectedGhoFilter.value,
  ]);

  return (
    <>
      {riskOrderedData.map(([riskData, risk]) => (
        <RiskToolGSEViewRow key={riskData.id} risk={risk} riskData={riskData} />
      ))}
      <div style={{ marginTop: 50 }} />
    </>
  );
};
