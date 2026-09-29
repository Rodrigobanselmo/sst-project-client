import { useEffect, useState } from 'react';

import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';

import { STableEmpty } from '@v2/components/organisms/STable/addons/addons-table/STableEmpty/STableEmpty';
import { useFetchBrowseRiskInventory } from '@v2/services/security/risk-inventory/useFetchBrowseRiskInventory';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

import { RiskInventoryColumnsDialog } from './RiskInventoryColumnsDialog';
import { RiskInventoryTable } from './RiskInventoryTable';

type RiskInventoryTabContentProps = {
  workspaceId?: string;
  queryEnabled?: boolean;
};

export function RiskInventoryTabContent({
  workspaceId,
  queryEnabled = true,
}: RiskInventoryTabContentProps) {
  const { companyId } = useGetCompanyId();
  const [columnsOpen, setColumnsOpen] = useState(false);
  const { data, isLoading, isError } = useFetchBrowseRiskInventory(
    {
      companyId: companyId || '',
      workspaceId: workspaceId || '',
    },
    { enabled: queryEnabled },
  );

  useEffect(() => {
    setColumnsOpen(false);
  }, [workspaceId]);

  if (!workspaceId) {
    return (
      <Box sx={{ p: 2 }}>
        <STableEmpty>
          <Typography fontSize={13}>Selecione um estabelecimento para ver o inventário.</Typography>
        </STableEmpty>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Não foi possível carregar o inventário de riscos.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, pb: 3, pt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          Visão somente leitura do inventário atual. A composição segue o inventário do PGR por GSE.
        </Typography>
        <Button variant="outlined" size="small" onClick={() => setColumnsOpen(true)} sx={{ flexShrink: 0 }}>
          Configurar colunas
        </Button>
      </Box>
      {data?.units.length ? (
        <RiskInventoryTable units={data.units} columnPreference={data.columnPreference} />
      ) : (
        <STableEmpty>
          <Typography fontSize={13}>Nenhum risco de inventário neste estabelecimento.</Typography>
        </STableEmpty>
      )}
      {companyId && workspaceId ? (
        <RiskInventoryColumnsDialog
          open={columnsOpen}
          companyId={companyId}
          workspaceId={workspaceId}
          columnPreference={data?.columnPreference ?? null}
          columnPreferenceSource={data?.columnPreferenceSource ?? 'canonical'}
          onClose={() => setColumnsOpen(false)}
        />
      ) : null}
    </Box>
  );
}
