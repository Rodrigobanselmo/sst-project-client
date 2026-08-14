import React, { FC, useEffect, useMemo } from 'react';

import { Box, Button, LinearProgress } from '@mui/material';
import SText from 'components/atoms/SText';
import { selectGhoFilter } from 'store/reducers/hierarchy/ghoSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useQueryAllRisk } from 'core/services/hooks/queries/useQueryRiskAll';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import {
  RISK_LINKAGE_LOAD_ERROR_MESSAGE,
  riskLinkageEmptyMessage,
} from 'core/utils/risk-linkage-guards.util';

import { joinRiskToolGseRows } from './join-risk-tool-gse-rows.util';
import { resolveRiskToolGseListGate } from './resolve-risk-tool-gse-list-gate.util';
import { useRiskRowsExpandOptional } from './RiskRowsExpandContext';
import { RiskToolGSEViewRow } from './Row';
import { RiskToolGSEViewProps } from './types';

export const RiskToolGSEView: FC<{ children?: any } & RiskToolGSEViewProps> = ({
  riskGroupId,
}) => {
  const selectedGhoFilter = useAppSelector(selectGhoFilter);
  const selectedGho = useAppSelector((state) => state.gho.selected);
  const expandCtx = useRiskRowsExpandOptional();

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

  const {
    data: riskCatalog,
    isLoading: isCatalogLoading,
    isFetching: isCatalogFetching,
    isFetched: isCatalogFetched,
  } = useQueryAllRisk();

  const riskOrderedData = useMemo(
    () =>
      joinRiskToolGseRows({
        isCatalogFetched,
        riskCatalog,
        riskDataQuery,
        homoId,
        selectedGhoFilter,
        riskGroupId,
      }),
    [
      isCatalogFetched,
      riskCatalog,
      riskDataQuery,
      homoId,
      selectedGhoFilter,
      riskGroupId,
    ],
  );

  const listGate = resolveRiskToolGseListGate({
    homoId,
    isRiskDataLoading: isRiskGhoLoading,
    isRiskDataError: isRiskGhoError,
    isCatalogFetched,
    isCatalogLoading,
    isCatalogFetching,
    joinedRowCount: riskOrderedData.length,
  });

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

  if (listGate.state === 'no-selection') {
    return (
      <Box sx={{ py: 4, px: 2 }}>
        <SText color="text.secondary">
          {riskLinkageEmptyMessage({ hasSelection: false })}
        </SText>
      </Box>
    );
  }

  if (listGate.state === 'loading') {
    return <LinearProgress />;
  }

  if (listGate.state === 'error') {
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

  if (listGate.state === 'empty') {
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
