import { useCallback, useEffect, useMemo, useState } from 'react';

import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
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
  prioritizationOrientationToPersist,
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

  return (
    <Box sx={{ p: 2, pt: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Visão consolidada do risco ocupacional atual. Clique na célula para abrir
        a origem. Edição é feita na fonte (GSE ou Elemento Caracterizado).
      </Typography>
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
        onCellClick={handleCellClick}
      />
      <RiskPrioritizationLegend entries={viewData.legend} />
      <RiskPrioritizationOriginsDrawer
        open={Boolean(selectedCell)}
        onClose={() => setSelectedCell(null)}
        riskName={selectedRiskName}
        cellLabel={
          selectedCell
            ? `${selectedCell.abbreviation} — ${selectedCell.label}`
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
