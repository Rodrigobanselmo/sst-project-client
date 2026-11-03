import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useSstAccess } from './access';
import { messageOf, sstGet, sstPost } from './api';

type OperationalStatus = {
  generatedAt: string;
  states: Record<string, number>;
  metrics: {
    dueDeliveries: number;
    unknownDeliveries: number;
    rejectedDeliveries: number;
    blockedDeliveries: number;
  };
  alerts: {
    code: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    action: string;
  }[];
  healthy: boolean;
};

export function OperationalStatusSummary({ companyId }: { companyId: string }) {
  const access = useSstAccess();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const attempt = useRef<{ reason: string; operationId: string } | null>(null);
  const status = useQuery<OperationalStatus>(
    ['sst-operational-health', companyId],
    () => sstGet(companyId, '/sst-operational/health'),
    {
      enabled: access.canReadOperations,
      retry: false,
      refetchInterval: 30_000,
    },
  );
  const reconcile = async () => {
    const note = reason.trim();
    if (!note || busy) return;
    if (attempt.current?.reason !== note)
      attempt.current = { reason: note, operationId: crypto.randomUUID() };
    setBusy(true);
    setError('');
    try {
      await sstPost(companyId, '/sst-operational/reconcile', {
        reason: note,
        operationId: attempt.current.operationId,
      });
      setOpen(false);
      setMessage(
        'A conferência das pendências foi solicitada. Nenhum evento foi transmitido por esta ação.',
      );
      attempt.current = null;
      await Promise.all([
        client.invalidateQueries(['sst-operational-health', companyId]),
        client.invalidateQueries(['sst-pending', companyId]),
      ]);
    } catch (failure) {
      setError(messageOf(failure));
    } finally {
      setBusy(false);
    }
  };
  if (!access.canReadOperations) return null;
  return (
    <Box
      role="region"
      aria-label="Situação do acompanhamento eSocial"
      sx={{
        p: '16px',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Stack spacing={8} useFlexGap>
        <Typography variant="subtitle1">Conferência dos envios</Typography>
        {status.isError && (
          <Alert severity="warning">
            Não foi possível atualizar este resumo. Os resultados individuais
            continuam disponíveis abaixo.{' '}
            <Button onClick={() => status.refetch()}>Atualizar resumo</Button>
          </Alert>
        )}
        {status.data && (
          <>
            <Stack direction="row" spacing={8} useFlexGap flexWrap="wrap">
              <Chip
                label={`${status.data.states.ACCEPTED || 0} aceitos`}
                color="success"
                variant="outlined"
              />
              <Chip
                label={`${status.data.metrics.dueDeliveries} aguardando processamento`}
                variant="outlined"
              />
              <Chip
                label={`${status.data.metrics.unknownDeliveries} em conferência de resultado`}
                variant="outlined"
              />
              <Chip
                label={`${status.data.metrics.rejectedDeliveries} rejeitados`}
                variant="outlined"
              />
            </Stack>
            {status.data.alerts.map((alert) => (
              <Alert
                key={alert.code}
                severity={
                  alert.severity === 'CRITICAL'
                    ? 'error'
                    : alert.severity === 'WARNING'
                      ? 'warning'
                      : 'info'
                }
              >
                {alert.code === 'LOCAL_PROCESSING_FAILED'
                  ? 'Algumas atualizações precisam de assistência para concluir sua conferência. Entre em contato com o suporte.'
                  : alert.message}
              </Alert>
            ))}
            {!status.data.alerts.length && (
              <Typography variant="body2" color="text.secondary">
                Nenhum alerta de acompanhamento nesta consulta. Confira o
                resultado de cada evento antes de considerar o envio concluído.
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Resumo atualizado em{' '}
              {new Date(status.data.generatedAt).toLocaleString('pt-BR')}.
            </Typography>
          </>
        )}
        {message && <Alert severity="info">{message}</Alert>}
        {access.canReconcileOperations && (
          <Button
            variant="outlined"
            onClick={() => {
              setOpen(true);
              setError('');
            }}
          >
            Atualizar pendências
          </Button>
        )}
        <Dialog
          open={open}
          onClose={() => !busy && setOpen(false)}
          fullWidth
          maxWidth="sm"
          aria-labelledby="sst-reconcile-title"
        >
          <DialogTitle id="sst-reconcile-title" sx={{ p: '24px', pb: '16px' }}>
            Atualizar pendências
          </DialogTitle>
          <DialogContent sx={{ px: '24px', py: '8px' }}>
            <Stack spacing={8} useFlexGap>
              <Alert severity="info">
                Esta ação solicita uma nova conferência dos dados locais. Não
                transmite eventos, não altera recibos e não reenvia resultados
                incertos.
              </Alert>
              <TextField
                label="Motivo da conferência"
                fullWidth
                multiline
                minRows={2}
                value={reason}
                disabled={busy}
                onChange={(e) => setReason(e.target.value)}
              />
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions
            disableSpacing
            sx={{ p: '24px', gap: '16px', flexWrap: 'wrap' }}
          >
            <Button disabled={busy} onClick={() => setOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="contained"
              disabled={busy || !reason.trim()}
              onClick={() => void reconcile()}
            >
              Solicitar conferência
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}
