import { Box, Button, Divider, Drawer, Stack, Typography } from '@mui/material';

import { RiskPrioritizationOrigin } from '@v2/services/security/risk-prioritization/risk-prioritization.types';

import {
  isOriginNavigable,
  sortPrioritizationOrigins,
} from './risk-prioritization.util';

export function RiskPrioritizationOriginsDrawer({
  open,
  onClose,
  riskName,
  cellLabel,
  origins,
  onOpenOrigin,
}: {
  open: boolean;
  onClose: () => void;
  riskName?: string;
  cellLabel?: string;
  origins: RiskPrioritizationOrigin[];
  onOpenOrigin: (origin: RiskPrioritizationOrigin) => void;
}) {
  const sorted = sortPrioritizationOrigins(origins);
  const determinants = sorted.filter((origin) => origin.isDeterminant);
  const others = sorted.filter((origin) => !origin.isDeterminant);

  const renderOrigin = (origin: RiskPrioritizationOrigin) => {
    const navigable = isOriginNavigable(origin);
    const hierarchyHint =
      origin.originKind === 'HIERARCHY'
        ? 'Origem hierárquica — sem edição direta nesta tela.'
        : null;

    return (
      <Box
        key={origin.riskFactorDataId}
        sx={{
          p: 1.5,
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: 1,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {origin.originTypeLabel}
        </Typography>
        <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
          {origin.originName}
        </Typography>
        {hierarchyHint && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {hierarchyHint}
          </Typography>
        )}
        {navigable && (
          <Button
            size="small"
            variant="outlined"
            sx={{ mt: 1 }}
            onClick={() => onOpenOrigin(origin)}
          >
            Abrir na origem
          </Button>
        )}
      </Box>
    );
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 320, sm: 400 }, p: 2.5 }}>
        <Typography variant="h6" fontWeight={700}>
          Origens do risco
        </Typography>
        {(riskName || cellLabel) && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            {[riskName, cellLabel].filter(Boolean).join(' · ')}
          </Typography>
        )}

        <Stack spacing={2}>
          {!!determinants.length && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Determina o valor exibido
              </Typography>
              <Stack spacing={1}>{determinants.map(renderOrigin)}</Stack>
            </Box>
          )}
          {!!others.length && (
            <Box>
              {!!determinants.length && <Divider sx={{ mb: 1.5 }} />}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Outras ocorrências
              </Typography>
              <Stack spacing={1}>{others.map(renderOrigin)}</Stack>
            </Box>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
