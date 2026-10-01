import { useState } from 'react';

import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';

import { useFetchBrowseSectorRiskPresence } from '@v2/services/security/sector-risk-presence/useFetchBrowseSectorRiskPresence';
import { SectorRiskPresenceOrigin } from '@v2/services/security/sector-risk-presence/sector-risk-presence.types';
import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';

import { buildSectorRiskPresenceNavigation } from './sector-risk-presence-navigation';
import { SectorRiskPresenceGrid } from './SectorRiskPresenceGrid';
import {
  SECTOR_RISK_PRESENCE_DEFAULT_ORIENTATION,
  SECTOR_RISK_PRESENCE_LEGEND,
  SectorRiskPresenceOrientation,
} from './sector-risk-presence.presentation';

export function SectorRiskPresenceView({
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
  const [orientation, setOrientation] = useState<SectorRiskPresenceOrientation>(
    SECTOR_RISK_PRESENCE_DEFAULT_ORIENTATION,
  );
  const { data: riskGroupData } = useQueryRiskGroupData();
  const riskGroupId = riskGroupData?.[riskGroupData.length - 1]?.id;
  // Lista usa este hook, que abre ModalEnum.RISK_TOOL — o modal montado nesta tela.
  const { onOpenRiskToolSelected } = useOpenRiskTool();
  const canLoad = queryEnabled && !isAllEstablishments && Boolean(workspaceId);
  const openOrigin = (params: {
    origin: SectorRiskPresenceOrigin;
    riskId: string;
    riskLabel: string;
  }) => {
    const target = buildSectorRiskPresenceNavigation(params);
    onOpenRiskToolSelected({
      homogeneousGroup: target.homogeneousGroup as IGho,
      riskFactor: target.riskFactor as IRiskFactors,
      riskGroupId,
    });
  };
  const { data, isError, isLoading, refetch } = useFetchBrowseSectorRiskPresence(
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
        Selecione um estabelecimento para ver o Mapa de Presença por setor.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant={orientation === 'RISKS_IN_ROWS' ? 'contained' : 'outlined'}
          onClick={() => setOrientation('RISKS_IN_ROWS')}
        >
          Riscos nas linhas
        </Button>
        <Button
          size="small"
          variant={orientation === 'SECTORS_IN_ROWS' ? 'contained' : 'outlined'}
          onClick={() => setOrientation('SECTORS_IN_ROWS')}
        >
          Setores nas linhas
        </Button>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {SECTOR_RISK_PRESENCE_LEGEND}
        </Typography>
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
          Não foi possível carregar o Mapa de Presença.
        </Alert>
      ) : null}
      {data && !data.risks.length && !data.sectors.length ? (
        <Alert severity="info">Nenhum fator de risco ou setor neste estabelecimento.</Alert>
      ) : null}
      {data && !data.risks.length && data.sectors.length > 0 ? (
        <Alert severity="info">Nenhum fator de risco no mapa deste estabelecimento.</Alert>
      ) : null}
      {data && data.risks.length > 0 && !data.sectors.length ? (
        <Alert severity="info">Nenhum setor alcançado por cargo neste estabelecimento.</Alert>
      ) : null}
      {data && data.risks.length > 0 && data.sectors.length > 0 ? (
        <SectorRiskPresenceGrid
          key={orientation}
          data={data}
          orientation={orientation}
          onOpenOrigin={openOrigin}
        />
      ) : null}
    </Box>
  );
}
