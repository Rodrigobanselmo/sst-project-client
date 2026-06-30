import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useConsolidateAcgihOfficialIndicators } from '@v2/services/medicine/acgih-risk-correlation/hooks/useConsolidateAcgihOfficialIndicators';
import {
  ACGIH_RISK_CORRELATION_CONSOLIDATE_CONFIRM_TEXT,
  AcgihConsolidateItemStatus,
  IAcgihConsolidateResponse,
} from '@v2/services/medicine/acgih-risk-correlation/service/acgih-risk-correlation.types';

type Props = {
  open: boolean;
  onClose: () => void;
  totalCount: number;
  promotedCount: number;
  notPromotedCount: number;
};

const itemStatusColor: Record<
  AcgihConsolidateItemStatus,
  'success' | 'default' | 'error' | 'info'
> = {
  created: 'success',
  alreadyPromoted: 'info',
  skipped: 'default',
  failed: 'error',
};

const itemStatusLabel: Record<AcgihConsolidateItemStatus, string> = {
  created: 'Promovido',
  alreadyPromoted: 'Já promovido',
  skipped: 'Ignorado',
  failed: 'Falhou',
};

const Count: FC<{ label: string; value: number }> = ({ label, value }) => (
  <Box
    sx={{
      px: 2,
      py: 1,
      minWidth: 110,
      textAlign: 'center',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
    }}
  >
    <Typography variant="h6">{value}</Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export const AcgihRiskCorrelationConsolidateDialog: FC<Props> = ({
  open,
  onClose,
  totalCount,
  promotedCount,
  notPromotedCount,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [result, setResult] = useState<IAcgihConsolidateResponse | null>(null);
  const consolidate = useConsolidateAcgihOfficialIndicators();

  useEffect(() => {
    if (!open) {
      setConfirmText('');
      setResult(null);
      consolidate.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canConfirm = useMemo(
    () =>
      confirmText.trim() === ACGIH_RISK_CORRELATION_CONSOLIDATE_CONFIRM_TEXT &&
      !consolidate.isPending,
    [confirmText, consolidate.isPending],
  );

  const handleConfirm = () => {
    if (!canConfirm) return;
    consolidate.mutate(
      { confirmText: ACGIH_RISK_CORRELATION_CONSOLIDATE_CONFIRM_TEXT },
      { onSuccess: (data) => setResult(data) },
    );
  };

  const handleClose = () => {
    if (consolidate.isPending) return;
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {!result ? (
        <>
          <DialogTitle>Promover ACGIH/BEI faltantes</DialogTitle>
          <DialogContent dividers>
            <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
              <Count label="Total ACGIH/BEI" value={totalCount} />
              <Count label="Já promovidos" value={promotedCount} />
              <Count label="Faltantes" value={notPromotedCount} />
            </Box>

            <Alert severity="warning" sx={{ mb: 1.5 }}>
              Esta ação promoverá <strong>todos</strong> os {totalCount}{' '}
              indicadores ACGIH/BEI da base como indicadores oficiais, inclusive
              os que possuem equivalente/cobertura NR-7. Cria apenas{' '}
              <strong>indicadores oficiais</strong> (não cria vínculos de risco,
              não cria regras na Biblioteca Risco × Exame, não altera NR-7 nem
              fatores de risco). É idempotente: itens já promovidos são apenas
              contabilizados.
            </Alert>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="body2" sx={{ mb: 1 }}>
              Para confirmar, digite exatamente{' '}
              <strong>{ACGIH_RISK_CORRELATION_CONSOLIDATE_CONFIRM_TEXT}</strong>:
            </Typography>
            <TextField
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              size="small"
              fullWidth
              placeholder={ACGIH_RISK_CORRELATION_CONSOLIDATE_CONFIRM_TEXT}
              disabled={consolidate.isPending}
              autoComplete="off"
            />

            {consolidate.isError && (
              <Alert severity="error" sx={{ mt: 1.5 }}>
                Não foi possível consolidar os indicadores ACGIH/BEI. A base pode
                estar incompleta (≠ {totalCount}), com bloqueios ou status não
                consolidável. Verifique o preview e tente novamente.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={consolidate.isPending}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={!canConfirm}
            >
              {consolidate.isPending ? 'Promovendo…' : 'Promover faltantes'}
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>Consolidação de indicadores — resultado</DialogTitle>
          <DialogContent dividers>
            <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
              <Count label="Total ACGIH/BEI" value={result.totalAcgih} />
              <Count label="Já promovidos" value={result.alreadyPromoted} />
              <Count label="Promovidos agora" value={result.created} />
              <Count label="Ignorados" value={result.skipped} />
              <Count label="Falhas" value={result.failed} />
            </Box>

            <Alert
              severity={result.failed > 0 ? 'warning' : 'success'}
              sx={{ mb: 1.5 }}
            >
              {result.created} indicador(es) promovido(s) agora e{' '}
              {result.alreadyPromoted} já existente(s). Total promovido:{' '}
              <strong>{result.created + result.alreadyPromoted}</strong> de{' '}
              {result.totalAcgih}.{' '}
              {result.failed > 0
                ? `${result.failed} item(ns) falharam e podem ser reexecutados.`
                : 'Consolidação concluída — agora você pode consolidar os vínculos com Fatores de Risco.'}
            </Alert>

            {result.items.length > 0 && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Itens processados
                </Typography>
                <List dense sx={{ maxHeight: 280, overflow: 'auto' }}>
                  {result.items.map((item) => (
                    <ListItem
                      key={item.acgihBeiIndicatorId}
                      sx={{ alignItems: 'flex-start' }}
                      secondaryAction={
                        <Chip
                          size="small"
                          color={itemStatusColor[item.status]}
                          label={itemStatusLabel[item.status]}
                        />
                      }
                    >
                      <ListItemText
                        primary={item.substanceName}
                        secondary={item.reason ?? undefined}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={onClose}>
              Fechar
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};
