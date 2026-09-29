import { useCallback, useEffect, useMemo, useState } from 'react';

import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { Alert, Box, Button, CircularProgress, IconButton, Popover, Typography } from '@mui/material';
import { useRouter } from 'next/router';

import { RiskPrioritizationGrid, omitRepresentAllPrioritizationRisks } from '@v2/pages/companies/risk-prioritization/RiskPrioritizationGrid';
import { RiskPrioritizationLegend } from '@v2/pages/companies/risk-prioritization/RiskPrioritizationLegend';
import { RiskPrioritizationOriginsDrawer } from '@v2/pages/companies/risk-prioritization/RiskPrioritizationOriginsDrawer';
import {
  resolvePrioritizationCellClick,
  resolvePrioritizationOriginNavigation,
  resolvePrioritizationViewState,
} from '@v2/pages/companies/risk-prioritization/risk-prioritization.util';
import {
  displayedPrioritizationOrientation,
  legendForPrioritizationState,
  PrioritizationRiskState,
  prioritizationOrientationToPersist,
  visiblePrioritizationClassification,
} from '@v2/pages/companies/risk-prioritization/risk-prioritization.presentation';
import { useFetchBrowseRiskPrioritization } from '@v2/services/security/risk-prioritization/useFetchBrowseRiskPrioritization';
import { useMutateRiskPrioritizationOrientation } from '@v2/services/security/risk-prioritization/useMutateRiskPrioritizationOrientation';
import {
  PrioritizationMatrixOrientation,
  RiskPrioritizationCell,
  RiskPrioritizationOrigin,
} from '@v2/services/security/risk-prioritization/risk-prioritization.types';
import { STableEmpty } from '@v2/components/organisms/STable/addons/addons-table/STableEmpty/STableEmpty';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { useQueryAllRisk } from 'core/services/hooks/queries/useQueryRiskAll';

type RiskPrioritizationTabContentProps = {
  workspaceId?: string;
  queryEnabled?: boolean;
};

const RISK_STATE_HELP: Record<
  PrioritizationRiskState,
  { title: string; text: string; label: string }
> = {
  REAL: {
    title: 'Risco Real (Puro/Inerente)',
    text: 'Risco constatado na avaliação, considerando os controles existentes no momento da caracterização.',
    label: 'Definição de risco real',
  },
  RESIDUAL: {
    title: 'Risco Residual',
    text: 'Risco remanescente após a implantação e/ou ajuste das medidas de controle recomendadas.',
    label: 'Definição de risco residual',
  },
};

export function RiskPrioritizationTabContent({
  workspaceId,
  queryEnabled = true,
}: RiskPrioritizationTabContentProps) {
  const router = useRouter();
  const { companyId } = useGetCompanyId();
  const { onStackOpenModal } = useModal();
  const [selectedCell, setSelectedCell] = useState<RiskPrioritizationCell | null>(
    null,
  );

  useEffect(() => {
    setSelectedCell(null);
  }, [workspaceId]);

  const enabled = queryEnabled && Boolean(companyId) && Boolean(workspaceId);
  const { data, isLoading, isError, error } = useFetchBrowseRiskPrioritization(
    {
      companyId: companyId || '',
      workspaceId: workspaceId || '',
    },
    { enabled },
  );
  const orientationMutation = useMutateRiskPrioritizationOrientation();
  const { data: riskCatalog } = useQueryAllRisk();
  const viewData = useMemo(() => {
    if (!data) return data;
    const representAllRiskIds = new Set(
      (riskCatalog || [])
        .filter((risk) => risk.representAll)
        .map((risk) => risk.id),
    );
    return omitRepresentAllPrioritizationRisks(data, representAllRiskIds);
  }, [data, riskCatalog]);

  useEffect(() => {
    if (!selectedCell || !viewData) return;
    const stillVisible = viewData.columns.some(
      (column) => column.riskId === selectedCell.riskId,
    );
    if (!stillVisible) setSelectedCell(null);
  }, [selectedCell, viewData]);

  const viewState = resolvePrioritizationViewState({
    workspaceId,
    isLoading,
    isError,
    hasData: Boolean(data && (data.rows.length || data.cells.length)),
  });

  const openOrigin = useCallback(
    (origin: RiskPrioritizationOrigin) => {
      const action = resolvePrioritizationOriginNavigation({
        origin,
        companyId,
      });
      if (!action) return;
      if (action.type === 'characterization') {
        void router.push(action.href);
        return;
      }
      onStackOpenModal(action.modal, action.payload);
    },
    [companyId, onStackOpenModal, router],
  );

  const storedOrientation = data?.matrixOrientation ?? null;
  const displayedOrientation = displayedPrioritizationOrientation(storedOrientation);
  const [riskState, setRiskState] = useState<PrioritizationRiskState>('REAL');
  const [riskHelp, setRiskHelp] = useState<{
    anchor: HTMLElement;
    state: PrioritizationRiskState;
  } | null>(null);

  const selectOrientation = useCallback(
    (selected: PrioritizationMatrixOrientation) => {
      const next = prioritizationOrientationToPersist({
        event: 'select',
        stored: storedOrientation,
        selected,
      });
      if (!next || !companyId || !workspaceId) return;
      orientationMutation.mutate({
        companyId,
        workspaceId,
        orientation: next,
      });
    },
    [companyId, orientationMutation, storedOrientation, workspaceId],
  );

  const handleCellClick = useCallback(
    (cell: RiskPrioritizationCell) => {
      const next = resolvePrioritizationCellClick(cell);
      if (next.type === 'none') return;
      if (next.type === 'open-origin') {
        openOrigin(next.origin);
        return;
      }
      setSelectedCell(cell);
    },
    [openOrigin],
  );

  if (viewState === 'need-workspace') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Selecione um estabelecimento para visualizar a priorização.
        </Alert>
      </Box>
    );
  }

  if (viewState === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 280,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (viewState === 'error') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {(error as { message?: string } | undefined)?.message ||
            'Não foi possível carregar a priorização de riscos.'}
        </Alert>
      </Box>
    );
  }

  if (viewState === 'empty' || !data || !viewData) {
    return (
      <Box sx={{ p: 3 }}>
        <STableEmpty>
          <Typography fontSize={13}>
            Nenhum risco para priorizar neste estabelecimento.
          </Typography>
        </STableEmpty>
      </Box>
    );
  }

  const selectedRiskName = selectedCell
    ? viewData.columns.find((column) => column.riskId === selectedCell.riskId)?.name
    : undefined;
  const selectedVisible = selectedCell
    ? visiblePrioritizationClassification(selectedCell, riskState)
    : null;

  return (
    <Box sx={{ p: 2, pt: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Visão consolidada do risco ocupacional. Clique na célula para abrir a
        origem. Edição é feita na fonte (GSE ou Elemento Caracterizado).
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        {(['REAL', 'RESIDUAL'] as const).map((state) => (
          <Box key={state} sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Button
              size="small"
              variant={riskState === state ? 'contained' : 'outlined'}
              onClick={() => setRiskState(state)}
            >
              {state === 'REAL' ? 'Risco real' : 'Risco residual'}
            </Button>
            <IconButton
              size="small"
              aria-label={RISK_STATE_HELP[state].label}
              aria-expanded={riskHelp?.state === state}
              onClick={(event) =>
                setRiskHelp({ anchor: event.currentTarget, state })
              }
              sx={{ ml: 0.25, color: 'text.secondary' }}
            >
              <InfoOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        ))}
        <Popover
          open={Boolean(riskHelp)}
          anchorEl={riskHelp?.anchor}
          onClose={() => setRiskHelp(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {riskHelp ? (
            <Box sx={{ p: 1.5, maxWidth: 280 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {RISK_STATE_HELP[riskHelp.state].title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {RISK_STATE_HELP[riskHelp.state].text}
              </Typography>
            </Box>
          ) : null}
        </Popover>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant={displayedOrientation === 'UNITS_IN_ROWS' ? 'contained' : 'outlined'}
          disabled={orientationMutation.isPending}
          onClick={() => selectOrientation('UNITS_IN_ROWS')}
        >
          Unidades nas linhas
        </Button>
        <Button
          size="small"
          variant={displayedOrientation === 'RISKS_IN_ROWS' ? 'contained' : 'outlined'}
          disabled={orientationMutation.isPending}
          onClick={() => selectOrientation('RISKS_IN_ROWS')}
        >
          Riscos nas linhas
        </Button>
        <Typography variant="caption" color="text.secondary">
          {storedOrientation
            ? 'Esta orientação vale para a tela e para a próxima geração do Word.'
            : 'Ainda sem escolha gravada: a tela usa unidades nas linhas e o Word mantém a orientação automática.'}
        </Typography>
      </Box>
      {orientationMutation.isError ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          Não foi possível gravar a orientação da matriz.
        </Alert>
      ) : null}
      <RiskPrioritizationGrid
        data={viewData}
        orientation={displayedOrientation}
        riskState={riskState}
        onCellClick={handleCellClick}
      />
      <RiskPrioritizationLegend
        entries={legendForPrioritizationState(viewData, riskState)}
      />
      <RiskPrioritizationOriginsDrawer
        open={Boolean(selectedCell)}
        onClose={() => setSelectedCell(null)}
        riskName={selectedRiskName}
        cellLabel={
          selectedVisible
            ? `${selectedVisible.abbreviation} — ${selectedVisible.label}`
            : selectedCell && riskState === 'RESIDUAL'
              ? 'Sem classificação residual'
              : undefined
        }
        origins={selectedCell?.origins || []}
        onOpenOrigin={(origin) => {
          setSelectedCell(null);
          openOrigin(origin);
        }}
      />
    </Box>
  );
}
