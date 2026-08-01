import React, { FC, useEffect, useMemo } from 'react';

import { Box, Button, LinearProgress } from '@mui/material';
import SText from 'components/atoms/SText';
import { RiskEnum } from 'project/enum/risk.enums';
import { selectGhoFilter } from 'store/reducers/hierarchy/ghoSlice';

import { QueryEnum } from 'core/enums/query.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { queryClient } from 'core/services/queryClient';
import { sortDate } from 'core/utils/sorts/data.sort';
import { sortFilter } from 'core/utils/sorts/filter.sort';
import { effectiveRiskOrderForGSEGrid } from 'core/utils/sorts/risk-gse-grid-order';
import { sortNumber } from 'core/utils/sorts/number.sort';
import {
  RISK_LINKAGE_LOAD_ERROR_MESSAGE,
  riskLinkageEmptyMessage,
} from 'core/utils/risk-linkage-guards.util';

import { useRiskRowsExpandOptional } from './RiskRowsExpandContext';
import { RiskToolGSEViewRow } from './Row';
import { RiskToolGSEViewProps } from './types';

export const RiskToolGSEView: FC<{ children?: any } & RiskToolGSEViewProps> = ({
  riskGroupId,
}) => {
  const selectedGhoFilter = useAppSelector(selectGhoFilter);
  const selectedGho = useAppSelector((state) => state.gho.selected);
  const expandCtx = useRiskRowsExpandOptional();

  const { companyId: userCompanyId } = useGetCompanyId(true);

  const homoId = useMemo(
    () => String(selectedGho?.id || '').split('//')[0],
    [selectedGho?.id],
  );

  const {
    data: riskDataQuery,
    isLoading: isRiskGhoLoading,
    isError: isRiskGhoError,
    refetch: refetchRiskGho,
  } = useQueryRiskDataByGho(riskGroupId as string, homoId);

  const riskOrderedData = useMemo(() => {
    if (!Array.isArray(riskDataQuery)) return [];

    const risk = queryClient.getQueryData([
      QueryEnum.RISK,
      userCompanyId,
    ]) as IRiskFactors[] | undefined;

    if (!Array.isArray(risk)) return [];

    const representAllRiskData: [IRiskData, IRiskFactors][] = [];

    // Copy before sort — React Query may freeze cached arrays.
    const data = [...riskDataQuery]
      .sort((a, b) =>
        sortDate(
          b.endDate || new Date('3000-01-01T00:00:00.00Z'),
          a.endDate || new Date('3000-01-01T00:00:00.00Z'),
        ),
      )
      .sort((a, b) =>
        sortFilter(a, b, selectedGhoFilter.value, selectedGhoFilter.key),
      )
      .map((riskData) => {
        const riskFound = risk.find((r) => r.id === riskData.riskId);

        if (riskFound?.representAll && riskFound.type === RiskEnum.OUTROS) {
          representAllRiskData[0] = [riskData, riskFound];
        }
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

    const sortableData = data.filter(
      (pair): pair is [IRiskData, IRiskFactors] =>
        !!pair?.[0] && !!pair?.[1]?.id,
    );

    if (
      (!selectedGhoFilter.value && !selectedGhoFilter.key) ||
      selectedGhoFilter?.value == 'none'
    )
      return [...sortableData]
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

    return [...sortableData].sort(([, a], [, b]) =>
      sortNumber(
        effectiveRiskOrderForGSEGrid(a),
        effectiveRiskOrderForGSEGrid(b),
      ),
    );
  }, [
    riskDataQuery,
    userCompanyId,
    homoId,
    selectedGhoFilter.value,
    selectedGhoFilter.key,
    riskGroupId,
  ]);

  const knownRowIds = useMemo(
    () =>
      riskOrderedData
        .map(([riskData, risk]) =>
          String(riskData?.id || risk?.id || riskData?.riskId || ''),
        )
        .filter(Boolean),
    [riskOrderedData],
  );

  useEffect(() => {
    expandCtx?.setKnownRowIds(knownRowIds);
  }, [expandCtx?.setKnownRowIds, knownRowIds]);

  if (!homoId) {
    return (
      <Box sx={{ py: 4, px: 2 }}>
        <SText color="text.secondary">
          {riskLinkageEmptyMessage({ hasSelection: false })}
        </SText>
      </Box>
    );
  }

  if (isRiskGhoLoading) {
    return <LinearProgress />;
  }

  if (isRiskGhoError) {
    return (
      <Box sx={{ py: 4, px: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <SText color="text.secondary">{RISK_LINKAGE_LOAD_ERROR_MESSAGE}</SText>
        <Button
          variant="outlined"
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => void refetchRiskGho()}
        >
          Tentar novamente
        </Button>
      </Box>
    );
  }

  if (riskOrderedData.length === 0) {
    return (
      <Box sx={{ py: 4, px: 2 }}>
        <SText color="text.secondary">
          {riskLinkageEmptyMessage({ hasSelection: true })}
        </SText>
      </Box>
    );
  }

  return (
    <>
      {riskOrderedData.map(([riskData, risk]) => (
        <RiskToolGSEViewRow
          key={riskData?.id || risk?.id || riskData?.riskId}
          risk={risk}
          riskData={riskData}
          riskGroupId={riskGroupId}
        />
      ))}
    </>
  );
};
