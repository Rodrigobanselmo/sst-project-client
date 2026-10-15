import React, { FC, useEffect, useMemo, useState } from 'react';

import { Box, Button, LinearProgress, TextField } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import STooltip from 'components/atoms/STooltip';

import { tableUtilityPillSx } from 'configs/theme/brand-identity-fill';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import {
  useQueryRiskData,
  useRiskDataOperationWorkspaceId,
} from 'core/services/hooks/queries/useQueryRiskData';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import {
  coerceRiskDataList,
  RISK_LINKAGE_LOAD_ERROR_MESSAGE,
} from 'core/utils/risk-linkage-guards.util';

import { ViewsDataEnum as V1ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';

import { RiskToolColumns } from '../../RiskToolHeader/RiskToolColumns';
import { useRiskToolWideViewOptional } from '../../RiskToolWideViewContext';
import { useRiskRowsExpandOptional } from '../RiskToolGSEView/RiskRowsExpandContext';
import {
  buildRiskToolByRiskRows,
  filterRiskToolByRiskRows,
  riskToolByRiskRowIds,
} from './build-risk-tool-by-risk-rows.util';
import { RiskToolByRiskRow } from './Row';

type RiskToolByRiskViewProps = {
  risk: IRiskFactors;
  riskGroupId: string;
  /** Valor da V1 (`state.riskAdd.viewData`). */
  viewData: string;
  /** Ações já existentes da visualização por risco (ex.: residual 1 em todos). */
  extraActions?: React.ReactNode;
};

export const RiskToolByRiskView: FC<RiskToolByRiskViewProps> = ({
  risk,
  riskGroupId,
  viewData,
  extraActions,
}) => {
  const expandCtx = useRiskRowsExpandOptional();
  const wideCtx = useRiskToolWideViewOptional();
  const workspaceId = useRiskDataOperationWorkspaceId();
  const [search, setSearch] = useState('');

  const { data: ghos, isLoading: isGhoLoading } = useQueryGHOAll();
  const {
    data: riskDataList,
    isLoading: isRiskDataLoading,
    isError: isRiskDataError,
    refetch,
  } = useQueryRiskData(riskGroupId, risk.id);

  const rows = useMemo(
    () =>
      buildRiskToolByRiskRows({
        ghos,
        riskDataList: coerceRiskDataList(riskDataList),
        viewData,
        workspaceId,
      }),
    [ghos, riskDataList, viewData, workspaceId],
  );

  const knownRowIds = useMemo(() => riskToolByRiskRowIds(rows), [rows]);

  useEffect(() => {
    expandCtx?.setKnownRowIds(knownRowIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandCtx?.setKnownRowIds, knownRowIds]);

  const activeRows = filterRiskToolByRiskRows(rows.active, search);
  const historicalRows = filterRiskToolByRiskRows(rows.historical, search);
  const groupLabel =
    viewData === V1ViewsDataEnum.GSE
      ? 'GSE'
      : viewData === V1ViewsDataEnum.ENVIRONMENT
        ? 'ambiente'
        : 'elemento caracterizado';

  if (isRiskDataLoading || isGhoLoading) return <LinearProgress />;

  if (isRiskDataError) {
    return (
      <Box sx={{ py: 4, px: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <SText color="text.secondary">{RISK_LINKAGE_LOAD_ERROR_MESSAGE}</SText>
        <Button
          variant="outlined"
          size="small"
          sx={{ alignSelf: 'flex-start' }}
          onClick={() => void refetch()}
        >
          Tentar novamente
        </Button>
      </Box>
    );
  }

  return (
    <>
      <SFlex align="center" gap={4} flexWrap="wrap" sx={{ flexShrink: 0 }}>
        <TextField
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Pesquisar ${groupLabel}`}
          sx={{ minWidth: 260 }}
          inputProps={{ 'aria-label': `Pesquisar ${groupLabel}` }}
        />
        {expandCtx?.hasRows && (
          <SButton
            variant="outlined"
            sx={{ height: 30 }}
            onClick={() =>
              expandCtx.allExpanded ? expandCtx.collapseAll() : expandCtx.expandAll()
            }
          >
            <SText sx={{ mr: 5 }}>
              {expandCtx.allExpanded ? 'Recolher todos' : 'Expandir todos'}
            </SText>
          </SButton>
        )}
        {wideCtx && (
          <STooltip
            title={
              wideCtx.wideView ? 'Sair da visualização ampla' : 'Visualização ampla'
            }
          >
            <SButton
              variant="outlined"
              sx={{
                ...tableUtilityPillSx,
                minWidth: 'auto',
                height: 30,
                ...(wideCtx.wideView
                  ? {
                      '&&': {
                        backgroundColor: 'primary.identityBackground',
                        color: 'primary.identityOn',
                        borderColor: 'primary.border',
                      },
                      '&:hover': {
                        backgroundColor: 'primary.identityBackgroundHover',
                        color: 'primary.identityOn',
                        borderColor: 'primary.border',
                      },
                      '&&:hover': {
                        backgroundColor: 'primary.identityBackgroundHover',
                        color: 'primary.identityOn',
                        borderColor: 'primary.border',
                      },
                    }
                  : {}),
              }}
              onClick={() => wideCtx.toggleWideView()}
            >
              <SText sx={{ mr: 5 }}>
                {wideCtx.wideView
                  ? 'Sair da visualização ampla'
                  : 'Visualização ampla'}
              </SText>
            </SButton>
          </STooltip>
        )}
        {extraActions}
      </SFlex>

      {!expandCtx?.allCollapsed && (
        <Box sx={{ flexShrink: 0 }}>
          <RiskToolColumns />
        </Box>
      )}

      {!knownRowIds.length && (
        <SText color="text.secondary" sx={{ py: 4, px: 2 }}>
          Nenhum {groupLabel} vinculado a este fator de risco
          {workspaceId ? ' no estabelecimento selecionado' : ''}.
        </SText>
      )}

      {!!knownRowIds.length && !activeRows.length && !historicalRows.length && (
        <SText color="text.secondary" sx={{ py: 4, px: 2 }}>
          Nenhum {groupLabel} encontrado para a pesquisa.
        </SText>
      )}

      {activeRows.map((row) => (
        <RiskToolByRiskRow
          key={row.rowId}
          row={row}
          risk={risk}
          riskGroupId={riskGroupId}
        />
      ))}

      {!!historicalRows.length && (
        <>
          <SText
            color="text.secondary"
            fontSize={13}
            fontWeight={600}
            sx={{ px: 1, pt: 3, pb: 1, flexShrink: 0 }}
          >
            Registros encerrados (somente leitura)
          </SText>
          {historicalRows.map((row) => (
            <RiskToolByRiskRow
              key={row.rowId}
              row={row}
              risk={risk}
              riskGroupId={riskGroupId}
            />
          ))}
        </>
      )}
    </>
  );
};
