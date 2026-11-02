import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from 'core/contexts/AuthContext';
import { civilDateDisplay } from './civil-date';
import { SstDateField, useSstDateValidity } from './SstDateField';
import { sstEditSession } from './edit-session';

export function SstEditSessionBanner() {
  const { user } = useAuth();
  const router = useRouter();
  const pathCompany = router.asPath.match(
    /\/empresas\/([0-9a-f-]{36})(?:\/|\?|$)/i,
  )?.[1];
  const companyId =
    typeof router.query.companyId === 'string'
      ? router.query.companyId
      : pathCompany || user?.companyId;
  const [active, setActive] = useState(sstEditSession.snapshot);
  const [clock, setClock] = useState(Date.now);
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(''),
    [reason, setReason] = useState(''),
    [error, setError] = useState('');
  const { datesValid, dateFieldValidity } = useSstDateValidity();
  useEffect(
    () => sstEditSession.subscribe(() => setActive(sstEditSession.snapshot())),
    [],
  );
  useEffect(() => {
    if (!router.isReady) return;
    sstEditSession.bindScope(user?.id, companyId);
    setEditing(false);
  }, [user?.id, companyId, router.isReady]);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  if (!active || active.userId !== user?.id || active.companyId !== companyId)
    return null;
  const expired =
    clock >= active.expiresAt || !sstEditSession.peek(user?.id, companyId);
  return (
    <>
      <Box
        component="section"
        role="region"
        aria-label="Contexto de alterações desta empresa"
        sx={{
          p: '8px',
          position: 'sticky',
          top: 0,
          zIndex: 1101,
          maxHeight: { xs: '32vh', sm: '220px' },
          overflowY: 'auto',
          backgroundColor: 'background.paper',
          flexShrink: 0,
          minWidth: 0,
          maxWidth: '100%',
        }}
      >
        <Alert
          severity={expired ? 'warning' : 'info'}
          sx={{ '& .MuiAlert-message': { minWidth: 0, width: '100%' } }}
        >
          <Stack spacing={4} useFlexGap>
            <Typography variant="body2" fontWeight={600}>
              {expired
                ? 'Contexto expirado. Confira a próxima alteração.'
                : `Novas condições desde ${civilDateDisplay(active.effectiveFrom)} nesta empresa.`}
            </Typography>
            <Typography
              variant="body2"
              title={active.reason}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              Motivo: {active.reason}
            </Typography>
            <Typography variant="body2">
              {active.reviewNext
                ? 'A próxima alteração que precisar de decisão será conferida individualmente.'
                : 'Válido nesta aba por até 2 horas; trocar de empresa encerra.'}{' '}
              Salvar não envia ao eSocial.
            </Typography>
            <Stack direction="row" spacing={4} useFlexGap flexWrap="wrap">
              <Button
                disabled={expired || active.reviewNext}
                onClick={() => sstEditSession.reviewNext()}
              >
                Conferir próxima alteração
              </Button>
              <Button
                onClick={() => {
                  setDate(active.effectiveFrom);
                  setReason(active.reason);
                  setError('');
                  setEditing(true);
                }}
              >
                Alterar contexto
              </Button>
              <Button onClick={() => sstEditSession.clear()}>
                Encerrar contexto
              </Button>
            </Stack>
          </Stack>
        </Alert>
      </Box>
      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        fullWidth
        aria-labelledby="sst-edit-session-title"
      >
        <DialogTitle id="sst-edit-session-title" sx={{ p: '24px' }}>
          Data das próximas alterações
        </DialogTitle>
        <DialogContent sx={{ px: '24px', py: '8px' }}>
          <Stack spacing={8} useFlexGap>
            <Alert severity="info">
              Somente novas condições desta empresa. Para corrigir um período,
              escolha conferir a próxima alteração. A ativação vale por 2 horas
              nesta aba.
            </Alert>
            <SstDateField
              label="Início das próximas condições"
              value={date}
              onChange={setDate}
              onValidityChange={dateFieldValidity('session-date')}
            />
            <TextField
              label="Motivo das próximas alterações"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              multiline
              inputProps={{ maxLength: 2000 }}
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions
          disableSpacing
          sx={{ p: '24px', gap: '8px', flexWrap: 'wrap' }}
        >
          <Button onClick={() => setEditing(false)}>Cancelar</Button>
          <Button
            disabled={!date || !reason.trim() || !datesValid}
            onClick={() => {
              try {
                sstEditSession.activate({
                  userId: active.userId,
                  companyId: active.companyId,
                  effectiveFrom: date,
                  reason,
                });
                setClock(Date.now());
                setEditing(false);
              } catch (failure) {
                setError(
                  failure instanceof Error
                    ? failure.message
                    : 'Confira os dados.',
                );
              }
            }}
          >
            Ativar por 2 horas
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
