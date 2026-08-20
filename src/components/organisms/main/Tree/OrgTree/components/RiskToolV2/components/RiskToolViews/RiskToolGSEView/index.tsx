import React, { FC, useEffect, useMemo } from 'react';

import { Box, Button, LinearProgress } from '@mui/material';
import SText from 'components/atoms/SText';
import { selectGhoFilter } from 'store/reducers/hierarchy/ghoSlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { useQueryAllRisk } from 'core/services/hooks/queries/useQueryRiskAll';
import { useQueryEffectiveRiskDataByGho } from 'core/services/hooks/queries/useQueryEffectiveRiskDataByGho';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import {
  RISK_LINKAGE_LOAD_ERROR_MESSAGE,
  riskLinkageEmptyMessage,
} from 'core/utils/risk-linkage-guards.util';

import { joinRiskToolGseRows } from './join-risk-tool-gse-rows.util';
import { resolveRiskToolGseListGate } from './resolve-risk-tool-gse-list-gate.util';
import {
  groupInheritedRowsByOrigin,
  splitEffectiveGseRows,
} from './split-effective-gse-rows.util';
import { GseInheritedOriginGroupHeader } from './GseInheritedOriginGroupHeader';
import { useRiskRowsExpandOptional } from './RiskRowsExpandContext';
import { RiskToolGSEViewRow } from './Row';
import { RiskToolGSEViewProps } from './types';

export const RiskToolGSEView: FC<{ children?: any } & RiskToolGSEViewProps> = ({
  riskGroupId,
  showEffectiveRisks = false,
}) => {
  const selectedGhoFilter = useAppSelector(selectGhoFilter);
  const selectedGho = useAppSelector((state) => state.gho.selected);
  const expandCtx = useRiskRowsExpandOptional();

  const homoId = useMemo(
    () => String(selectedGho?.id || '').split('//')[0],
    [selectedGho?.id],
  );

  const {
    data: riskDataDirect,
    isLoading: isRiskGhoDirectLoading,
    isError: isRiskGhoDirectError,
    refetch: refetchRiskGhoDirect,
  } = useQueryRiskDataByGho(
    showEffectiveRisks ? '' : (riskGroupId as string),
    showEffectiveRisks ? '' : homoId,
  );

  const {
    data: riskDataEffective,
    isLoading: isRiskGhoEffectiveLoading,
    isError: isRiskGhoEffectiveError,
    refetch: refetchRiskGhoEffective,
  } = useQueryEffectiveRiskDataByGho(
    riskGroupId as string,
    homoId,
    showEffectiveRisks,
  );

  const riskDataQuery = showEffectiveRisks
    ? riskDataEffective
    : riskDataDirect;
  const isRiskGhoLoading = showEffectiveRisks
    ? isRiskGhoEffectiveLoading
    : isRiskGhoDirectLoading;
  const isRiskGhoError = showEffectiveRisks
    ? isRiskGhoEffectiveError
    : isRiskGhoDirectError;
  const refetchRiskGho = showEffectiveRisks
    ? refetchRiskGhoEffective
    : refetchRiskGhoDirect;

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

  const groupedRows = useMemo(() => {
    if (!showEffectiveRisks) {
      return { direct: riskOrderedData, inherited: [] as typeof riskOrderedData };
    }
    return splitEffectiveGseRows({ rows: riskOrderedData, gseId: homoId });
  }, [homoId, riskOrderedData, showEffectiveRisks]);

  const inheritedOriginGroups = useMemo(
    () => groupInheritedRowsByOrigin(groupedRows.inherited),
    [groupedRows.inherited],
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
      [...groupedRows.direct, ...groupedRows.inherited]
        .map(([riskData, risk]) =>
          String(riskData?.id || risk?.id || riskData?.riskId || ''),
        )
        .filter(Boolean),
    [groupedRows],
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

  const showInheritedSection =
    showEffectiveRisks && groupedRows.inherited.length > 0;

  return (
    <>
      {showInheritedSection && (
        <SText
          color="text.secondary"
          fontSize={13}
          fontWeight={600}
          sx={{ px: 1, pt: 1, pb: 1 }}
        >
          Riscos vinculados diretamente a este GSE
        </SText>
      )}
      {groupedRows.direct.map(([riskData, risk]) => (
        <RiskToolGSEViewRow
          key={riskData?.id || `direct-${risk?.id}`}
          risk={risk}
          riskData={riskData}
          riskGroupId={riskGroupId}
        />
      ))}
      {showInheritedSection && (
        <>
          <SText
            color="text.secondary"
            fontSize={13}
            fontWeight={600}
            sx={{ px: 1, pt: 3, pb: 1 }}
          >
            Riscos provenientes de outras origens
          </SText>
          {inheritedOriginGroups.map((group, index) => (
            <Box key={group.key} sx={{ mb: 1 }}>
              <GseInheritedOriginGroupHeader
                originTypeLabel={group.originTypeLabel}
                originName={group.originName}
                sample={group.sample}
                isFirst={index === 0}
              />
              {group.rows.map(([riskData, risk]) => (
                <RiskToolGSEViewRow
                  key={
                    riskData?.id ||
                    `inherited-${risk?.id}-${riskData?.homogeneousGroupId}`
                  }
                  risk={risk}
                  riskData={riskData}
                  riskGroupId={riskGroupId}
                  readOnly
                  showEditHereAction
                />
              ))}
            </Box>
          ))}
        </>
      )}
    </>
  );
};
