import React, { FC, useMemo } from 'react';

import { LinearProgress } from '@mui/material';
import { RiskEnum } from 'project/enum/risk.enums';
import { selectGhoFilter } from 'store/reducers/hierarchy/ghoSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useQueryAllRisk } from 'core/services/hooks/queries/useQueryRiskAll';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { sortDate } from 'core/utils/sorts/data.sort';
import { sortFilter } from 'core/utils/sorts/filter.sort';
import { effectiveRiskOrderForGSEGrid } from 'core/utils/sorts/risk-gse-grid-order';
import { sortNumber } from 'core/utils/sorts/number.sort';

import { RiskToolGSEViewRow } from './Row';
import { RiskToolGSEViewProps } from './types';

function isRiskCatalogPending(params: {
  isFetched: boolean;
  isLoading: boolean;
  isFetching: boolean;
}): boolean {
  return !params.isFetched && (params.isLoading || params.isFetching);
}

export const RiskToolGSEView: FC<{ children?: any } & RiskToolGSEViewProps> = ({
  riskGroupId,
}) => {
  const selectedGhoFilter = useAppSelector(selectGhoFilter);
  const selectedGho = useAppSelector((state) => state.gho.selected);

  const homoId = useMemo(
    () => String(selectedGho?.id || '').split('//')[0],
    [selectedGho?.id],
  );

  //! performance optimization here
  const { data: riskDataQuery, isLoading: isRiskGhoLoading } =
    useQueryRiskDataByGho(riskGroupId as string, homoId);

  const {
    data: riskCatalog,
    isLoading: isCatalogLoading,
    isFetching: isCatalogFetching,
    isFetched: isCatalogFetched,
  } = useQueryAllRisk();

  const isCatalogPending = isRiskCatalogPending({
    isFetched: isCatalogFetched,
    isLoading: isCatalogLoading,
    isFetching: isCatalogFetching,
  });

  const riskOrderedData = useMemo(() => {
    if (!isCatalogFetched || !Array.isArray(riskCatalog)) return [];
    if (!riskDataQuery) return [];

    const risk = riskCatalog;

    const representAllRiskData: [IRiskData, IRiskFactors][] = [];

    //! here we are finding the risk and if not found does not apear, error if this risk is from company different than user will fail
    const data = riskDataQuery
      .sort((a, b) =>
        sortDate(
          b.endDate || new Date('3000-01-01T00:00:00.00Z'),
          a.endDate || new Date('3000-01-01T00:00:00.00Z'),
        ),
      )
      .sort(
        (a, b) =>
          sortFilter(a, b, selectedGhoFilter.value, selectedGhoFilter.key), //! performance optimization here or sort
      )
      .map((riskData) => {
        const riskFound = risk.find((r) => r.id === riskData.riskId);

        if (riskFound?.representAll && riskFound.type === RiskEnum.OUTROS) {
          representAllRiskData[0] = [riskData, riskFound];
        }
        //! attention risk not found
        //! here we are finding the risk and if not found does not apear, error if this risk is from company different than user will fail
        return [riskData, riskFound] as [IRiskData, IRiskFactors];
      })
      .filter(([, r]) => {
        if (r && !r.representAll) return true;
        return false;
      });

    if (representAllRiskData.length === 0) {
      const riskFound = risk.find(
        (r) => r.type == RiskEnum.OUTROS && r.representAll,
      );
      if (riskFound) {
        representAllRiskData[0] = [
          {
            companyId: '',
            id: '',
            created_at: new Date(),
            riskId: riskFound?.id,
            updated_at: new Date(),
            riskFactorGroupDataId: riskGroupId,
          },
          riskFound,
        ];
      }
    }

    if (homoId) data.push(...representAllRiskData);

    if (
      (!selectedGhoFilter.value && !selectedGhoFilter.key) ||
      selectedGhoFilter?.value == 'none'
    )
      return data
        .sort(([, a], [, b]) => sortNumber(a, b, 'name'))
        .sort(([, a], [, b]) =>
          sortNumber(a.representAll ? -1 : 1, b.representAll ? -1 : 1),
        )
        .sort(([, a], [, b]) =>
          sortNumber(
            effectiveRiskOrderForGSEGrid(a),
            effectiveRiskOrderForGSEGrid(b),
          ),
        );

    return data.sort(([, a], [, b]) =>
      sortNumber(
        effectiveRiskOrderForGSEGrid(a),
        effectiveRiskOrderForGSEGrid(b),
      ),
    );
  }, [
    riskDataQuery,
    riskCatalog,
    isCatalogFetched,
    homoId,
    selectedGhoFilter.value,
    selectedGhoFilter.key,
    riskGroupId,
  ]);

  return (
    <>
      {(isRiskGhoLoading || isCatalogPending) && <LinearProgress />}
      {riskOrderedData.map(([riskData, risk]) => (
        <RiskToolGSEViewRow
          key={riskData.id}
          risk={risk}
          riskData={riskData}
          riskGroupId={riskGroupId}
        />
      ))}
    </>
  );
};
