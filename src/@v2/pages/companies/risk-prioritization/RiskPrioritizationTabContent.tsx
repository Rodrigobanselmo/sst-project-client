import { useCallback, useEffect, useState } from 'react';

import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { useRouter } from 'next/router';

import { RiskPrioritizationGrid } from '@v2/pages/companies/risk-prioritization/RiskPrioritizationGrid';
import { RiskPrioritizationLegend } from '@v2/pages/companies/risk-prioritization/RiskPrioritizationLegend';
import { RiskPrioritizationOriginsDrawer } from '@v2/pages/companies/risk-prioritization/RiskPrioritizationOriginsDrawer';
import {
  resolvePrioritizationCellClick,
  resolvePrioritizationOriginNavigation,
  resolvePrioritizationViewState,
} from '@v2/pages/companies/risk-prioritization/risk-prioritization.util';
import { useFetchBrowseRiskPrioritization } from '@v2/services/security/risk-prioritization/useFetchBrowseRiskPrioritization';
import {
  RiskPrioritizationCell,
  RiskPrioritizationOrigin,
} from '@v2/services/security/risk-prioritization/risk-prioritization.types';
import { STableEmpty } from '@v2/components/organisms/STable/addons/addons-table/STableEmpty/STableEmpty';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';

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

  if (viewState === 'empty' || !data) {
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
    ? data.columns.find((column) => column.riskId === selectedCell.riskId)?.name
    : undefined;

  return (
    <Box sx={{ p: 2, pt: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Visão consolidada do risco ocupacional atual. Clique na célula para abrir
        a origem. Edição é feita na fonte (GSE ou Elemento Caracterizado).
      </Typography>
      <RiskPrioritizationGrid data={data} onCellClick={handleCellClick} />
      <RiskPrioritizationLegend entries={data.legend} />
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
