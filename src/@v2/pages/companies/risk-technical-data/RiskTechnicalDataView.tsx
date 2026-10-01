import { useState } from 'react';

import { Alert, Box, Button, CircularProgress } from '@mui/material';

import { useFetchBrowseRiskTechnicalData } from '@v2/services/security/risk-technical-data/useFetchBrowseRiskTechnicalData';

import { RiskTechnicalDataColumnsDialog } from './RiskTechnicalDataColumnsDialog';
import { RiskTechnicalDataGrid } from './RiskTechnicalDataGrid';
import {
  RiskTechnicalDataGroup,
  risksForTechnicalGroup,
  shouldLoadRiskTechnicalData,
} from './risk-technical-data.presentation';

export function RiskTechnicalDataView({
  companyId,
  workspaceId,
  isAllEstablishments,
  queryEnabled,
}: {
  companyId?: string;
  workspaceId?: string;
  isAllEstablishments: boolean;
  queryEnabled: boolean;
}) {
  const [group, setGroup] = useState<RiskTechnicalDataGroup>('PHYSICAL_CHEMICAL');
  const [columnsOpen, setColumnsOpen] = useState(false);
  const canLoad = shouldLoadRiskTechnicalData({
    queryEnabled,
    isAllEstablishments,
    workspaceId,
  });
  const { data, isError, isLoading, refetch } = useFetchBrowseRiskTechnicalData(
    { companyId: companyId || '', workspaceId: workspaceId || '' },
    { enabled: canLoad && Boolean(companyId) },
  );

  if (!queryEnabled) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isAllEstablishments || !workspaceId) {
    return (
      <Alert severity="info">
        Selecione um estabelecimento para ver os Dados Técnicos.
      </Alert>
    );
  }

  const visibleRisks = data ? risksForTechnicalGroup(data.risks, group) : [];
  const familyColumns = data?.columns?.[group === 'PHYSICAL_CHEMICAL' ? 'physicalChemical' : 'other'];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant={group === 'PHYSICAL_CHEMICAL' ? 'contained' : 'outlined'}
            onClick={() => setGroup('PHYSICAL_CHEMICAL')}
          >
            Físicos e Químicos
          </Button>
          <Button
            size="small"
            variant={group === 'OTHER' ? 'contained' : 'outlined'}
            onClick={() => setGroup('OTHER')}
          >
            Demais Fatores
          </Button>
        </Box>
        <Button variant="outlined" size="small" onClick={() => setColumnsOpen(true)}>
          Configurar colunas
        </Button>
      </Box>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : null}
      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Tentar de novo
            </Button>
          }
        >
          Não foi possível carregar os Dados Técnicos.
        </Alert>
      ) : null}
      {data && visibleRisks.length === 0 ? (
        <Alert severity="info">
          {group === 'PHYSICAL_CHEMICAL'
            ? 'Nenhum fator físico ou químico neste estabelecimento.'
            : 'Nenhum outro fator neste estabelecimento.'}
        </Alert>
      ) : null}
      {data && visibleRisks.length > 0 ? (
        <RiskTechnicalDataGrid
          risks={data.risks}
          group={group}
          columnPreference={familyColumns?.preference ?? null}
        />
      ) : null}
      {companyId && workspaceId ? (
        <RiskTechnicalDataColumnsDialog
          open={columnsOpen}
          companyId={companyId}
          workspaceId={workspaceId}
          family={group}
          columnPreference={familyColumns?.preference ?? null}
          columnPreferenceSource={familyColumns?.source ?? 'canonical'}
          onClose={() => setColumnsOpen(false)}
        />
      ) : null}
    </Box>
  );
}
