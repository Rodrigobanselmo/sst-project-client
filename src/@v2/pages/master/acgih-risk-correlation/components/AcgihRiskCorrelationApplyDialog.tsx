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
import { useApplyAcgihRiskCorrelation } from '@v2/services/medicine/acgih-risk-correlation/hooks/useApplyAcgihRiskCorrelation';
import {
  ACGIH_RISK_CORRELATION_APPLY_CONFIRM_TEXT,
  AcgihRiskCorrelationApplyItemStatus,
  IAcgihRiskCorrelationApplyResponse,
} from '@v2/services/medicine/acgih-risk-correlation/service/acgih-risk-correlation.types';

type Props = {
  open: boolean;
  onClose: () => void;
  promotedCount: number;
  expectedLinks: number;
};

const itemStatusColor: Record<
  AcgihRiskCorrelationApplyItemStatus,
  'success' | 'default' | 'error' | 'info'
> = {
  created: 'success',
  alreadyLinked: 'info',
  skipped: 'default',
  failed: 'error',
};

const itemStatusLabel: Record<AcgihRiskCorrelationApplyItemStatus, string> = {
  created: 'Vínculo criado',
  alreadyLinked: 'Já vinculado',
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

export const AcgihRiskCorrelationApplyDialog: FC<Props> = ({
  open,
  onClose,
  promotedCount,
  expectedLinks,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [result, setResult] = useState<IAcgihRiskCorrelationApplyResponse | null>(
    null,
  );
  const apply = useApplyAcgihRiskCorrelation();

  useEffect(() => {
    if (!open) {
      setConfirmText('');
      setResult(null);
      apply.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canConfirm = useMemo(
    () =>
      confirmText.trim() === ACGIH_RISK_CORRELATION_APPLY_CONFIRM_TEXT &&
      !apply.isPending,
    [confirmText, apply.isPending],
  );

  const handleConfirm = () => {
    if (!canConfirm) return;
    apply.mutate(
      {
        confirmText: ACGIH_RISK_CORRELATION_APPLY_CONFIRM_TEXT,
        dryRun: false,
      },
      {
        onSuccess: (data) => setResult(data),
      },
    );
  };

  const handleClose = () => {
    if (apply.isPending) return;
    onClose();
  };

  const tdiItem = useMemo(
    () =>
      result?.items.find(
        (item) => item.cardinality === 'MULTIPLE' && item.links.length >= 2,
      ) ?? null,
    [result],
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {!result ? (
        <>
          <DialogTitle>Consolidar vínculos com Fatores de Risco</DialogTitle>
          <DialogContent dividers>
            <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
              <Count label="Promovidos" value={promotedCount} />
              <Count label="Vínculos esperados" value={expectedLinks} />
            </Box>

            <Alert severity="warning" sx={{ mb: 1.5 }}>
              Esta ação criará vínculos reais entre os indicadores ACGIH/BEI
              promovidos e os Fatores de Risco homologados. Esperado:{' '}
              <strong>{promotedCount}</strong> indicadores promovidos e{' '}
              <strong>{expectedLinks}</strong> vínculos de risco, pois o TDI
              possui dois fatores. Esta ação <strong>não cria regras na
              Biblioteca Risco × Exame</strong>, não cria exames, não altera
              NR-7 e não altera fatores de risco.
            </Alert>

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="body2" sx={{ mb: 1 }}>
              Para confirmar, digite exatamente{' '}
              <strong>{ACGIH_RISK_CORRELATION_APPLY_CONFIRM_TEXT}</strong>:
            </Typography>
            <TextField
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              size="small"
              fullWidth
              placeholder={ACGIH_RISK_CORRELATION_APPLY_CONFIRM_TEXT}
              disabled={apply.isPending}
              autoComplete="off"
            />

            {apply.isError && (
              <Alert severity="error" sx={{ mt: 1.5 }}>
                Não foi possível consolidar os vínculos ACGIH/BEI × Fatores de
                Risco. Verifique sua conexão e tente novamente.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={apply.isPending}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={!canConfirm}
            >
              {apply.isPending ? 'Consolidando…' : 'Consolidar vínculos'}
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle>Consolidação de vínculos — resultado</DialogTitle>
          <DialogContent dividers>
            <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
              <Count label="Solicitados" value={result.totals.requestedItems} />
              <Count label="Elegíveis" value={result.totals.eligibleItems} />
              <Count label="Vínculos criados" value={result.totals.createdLinks} />
              <Count label="Já vinculados" value={result.totals.alreadyLinked} />
              <Count label="Ignorados" value={result.totals.skipped} />
              <Count label="Falhas" value={result.totals.failed} />
            </Box>

            <Alert
              severity={result.totals.failed > 0 ? 'warning' : 'success'}
              sx={{ mb: 1.5 }}
            >
              {result.totals.createdLinks} vínculo(s) criado(s) e{' '}
              {result.totals.alreadyLinked} já existente(s).{' '}
              {result.totals.failed > 0
                ? `${result.totals.failed} item(ns) falharam e podem ser reexecutados.`
                : 'Consolidação concluída.'}
            </Alert>

            {tdiItem && (
              <Alert severity="info" sx={{ mb: 1.5 }}>
                TDI ({tdiItem.substanceName}) consolidado com{' '}
                <strong>{tdiItem.links.length}</strong> vínculos de risco.
              </Alert>
            )}

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
                        primary={`${item.substanceName} · ${item.links.length} vínculo(s)`}
                        secondary={
                          item.skipReason
                            ? `Ignorado: ${item.skipReason}`
                            : item.error
                              ? item.error
                              : item.links
                                  .map((l) => l.riskName)
                                  .join(', ')
                        }
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
