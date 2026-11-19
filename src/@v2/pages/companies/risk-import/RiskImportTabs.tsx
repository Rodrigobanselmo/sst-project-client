import { useState } from 'react';
import { Box, Button, Stack, Tab, Tabs, Typography } from '@mui/material';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useImportExport } from 'core/hooks/useImportExport';
import { ReportTypeEnum } from 'core/services/hooks/mutations/reports/useMutReport/types';
import { RiskImportTabContent } from './RiskImportTabContent';

export function RiskImportTabs(props: {
  workspaceId?: string;
  queryEnabled?: boolean;
}) {
  const [tab, setTab] = useState('structure');
  const { companyId } = useGetCompanyId();
  const { handleUploadTable } = useImportExport();

  return (
    <Box
      sx={(theme) => ({
        color: theme.palette.mode === 'dark' ? '#e2e8f0' : 'text.primary',
      })}
    >
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Tipos de importação de riscos"
        sx={{
          px: '24px',
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { color: 'inherit' },
        }}
      >
        <Tab
          value="structure"
          id="risk-import-structure-tab"
          aria-controls="risk-import-structure-panel"
          label="Estrutura ocupacional e riscos — Excel"
        />
        <Tab
          value="psychosocial"
          id="risk-import-psychosocial-tab"
          aria-controls="risk-import-psychosocial-panel"
          label="Fatores de risco psicossociais"
        />
      </Tabs>
      <Box
        role="tabpanel"
        id="risk-import-structure-panel"
        aria-labelledby="risk-import-structure-tab"
        hidden={tab !== 'structure'}
      >
        <Stack spacing={10} sx={{ p: '24px' }}>
          <Typography variant="h5" color="inherit">
            Importar estrutura ocupacional e riscos
          </Typography>
          <Typography color="inherit">
            Baixe o modelo Excel, preencha a estrutura ocupacional e os fatores
            de risco e envie a planilha pelo fluxo de importação da empresa.
          </Typography>
          <Typography color="inherit">
            O modelo permite informar vínculos à hierarquia ou ao GSE,
            probabilidades, fontes geradoras, EPIs, EPCs, medidas
            administrativas, recomendações e datas de início e fim.
          </Typography>
          <Box>
            <Button
              variant="contained"
              disabled={!companyId}
              onClick={() => {
                if (!companyId) return;
                handleUploadTable({
                  companyId,
                  type: ReportTypeEnum.MODEL_RISK,
                  pathApi: ApiRoutesEnum.UPLOAD_COMPANY_STRUCTURE.replace(
                    ':companyId',
                    companyId,
                  ),
                  payload: { createRisk: true },
                  title: 'Importar estrutura ocupacional e riscos',
                });
              }}
            >
              Importar planilha Excel
            </Button>
          </Box>
        </Stack>
      </Box>
      {/* Preserva arquivo, vínculos e prévia ao alternar entre as subabas. */}
      <Box
        role="tabpanel"
        id="risk-import-psychosocial-panel"
        aria-labelledby="risk-import-psychosocial-tab"
        hidden={tab !== 'psychosocial'}
      >
        <RiskImportTabContent {...props} />
      </Box>
    </Box>
  );
}
