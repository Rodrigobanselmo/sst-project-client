import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import { useSyncAcgihExamLinks } from '@v2/services/medicine/acgih-risk-correlation/hooks/useSyncAcgihExamLinks';
import {
  ACGIH_EXAM_LINK_SYNC_CONFIRM_TEXT,
  AcgihExamLinkAction,
  IAcgihExamLinkSyncResponse,
} from '@v2/services/medicine/acgih-risk-correlation/service/acgih-risk-correlation.types';

type Props = {
  open: boolean;
  onClose: () => void;
};

const actionColor: Record<
  AcgihExamLinkAction,
  'success' | 'info' | 'warning' | 'error'
> = {
  linkCreated: 'success',
  alreadyLinked: 'info',
  blocked: 'warning',
  failed: 'error',
};

const actionLabel: Record<AcgihExamLinkAction, string> = {
  linkCreated: 'Vínculo',
  alreadyLinked: 'Já vinculado',
  blocked: 'Bloqueado',
  failed: 'Falhou',
};

const reasonLabel: Record<string, string> = {
  NO_EXAM_MATCH: 'Sem exame correspondente no catálogo',
  AMBIGUOUS_EXAM_MATCH: 'Múltiplos candidatos (ambíguo)',
  NO_OFFICIAL_INDICATOR: 'Indicador oficial ausente',
  MISSING_DETERMINANT: 'Determinante ausente',
  P2002_ALREADY_LINKED: 'Vínculo já existente',
};

const Count: FC<{ label: string; value: number }> = ({ label, value }) => (
  <Box
    sx={{
      px: 2,
      py: 1,
      minWidth: 96,
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

/**
 * Vínculo ACGIH/BEI → Exame. Ao abrir, executa uma prévia (dryRun=true) sem
 * escrita. O apply real (dryRun=false) exige a confirmação literal. O servidor
 * faz o match e cria apenas BiologicalIndicatorToExam.
 */
export const AcgihExamLinkDialog: FC<Props> = ({ open, onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [preview, setPreview] = useState<IAcgihExamLinkSyncResponse | null>(
    null,
  );
  const [result, setResult] = useState<IAcgihExamLinkSyncResponse | null>(null);
  const sync = useSyncAcgihExamLinks();

  useEffect(() => {
    if (!open) {
      setConfirmText('');
      setPreview(null);
      setResult(null);
      sync.reset();
      return;
    }
    // Prévia automática sem escrita ao abrir.
    sync.mutate(
      { confirmText: ACGIH_EXAM_LINK_SYNC_CONFIRM_TEXT, dryRun: true },
      { onSuccess: (data) => setPreview(data) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canConfirm = useMemo(
    () =>
      confirmText.trim() === ACGIH_EXAM_LINK_SYNC_CONFIRM_TEXT &&
      !sync.isPending &&
      !!preview,
    [confirmText, sync.isPending, preview],
  );

  const handleConfirm = () => {
    if (!canConfirm) return;
    sync.mutate(
      { confirmText: ACGIH_EXAM_LINK_SYNC_CONFIRM_TEXT, dryRun: false },
      { onSuccess: (data) => setResult(data) },
    );
  };

  const handleClose = () => {
    if (sync.isPending) return;
    onClose();
  };

  const view = result ?? preview;
  const isResult = !!result;
  const isLoadingPreview = !preview && sync.isPending && !result;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isResult
          ? 'Vincular exames ACGIH/BEI — resultado'
          : 'Vincular exames ACGIH/BEI'}
      </DialogTitle>
      <DialogContent dividers>
        {isLoadingPreview && (
          <Box display="flex" alignItems="center" gap={1.5} py={3}>
            <CircularProgress size={20} />
            <Typography variant="body2">Gerando prévia (sem escrita)…</Typography>
          </Box>
        )}

        {view && (
          <>
            <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
              <Count label="Indicadores" value={view.totals.indicators} />
              <Count
                label={isResult ? 'Vínculos criados' : 'A criar'}
                value={view.totals.linksCreated}
              />
              <Count label="Já vinculados" value={view.totals.alreadyLinked} />
              <Count label="Bloqueados" value={view.totals.blocked} />
              <Count label="Falhas" value={view.totals.failed} />
            </Box>

            {!isResult && (
              <Alert severity="info" sx={{ mb: 1.5 }}>
                Prévia sem escrita. Ao confirmar, o servidor cria apenas os{' '}
                <strong>vínculos indicador → exame</strong> (não cria exame novo,
                não cria regra na Biblioteca, não cria ExamToRisk em empresa, não
                altera NR-7 nem fatores de risco). Itens bloqueados precisam de
                curadoria manual.
              </Alert>
            )}

            {isResult && (
              <Alert
                severity={view.totals.failed > 0 ? 'warning' : 'success'}
                sx={{ mb: 1.5 }}
              >
                {view.totals.linksCreated} vínculo(s) criado(s),{' '}
                {view.totals.alreadyLinked} já existente(s),{' '}
                {view.totals.blocked} bloqueado(s).{' '}
                {view.totals.blocked > 0
                  ? 'Os bloqueados precisam de curadoria antes de aparecerem na Biblioteca.'
                  : 'Agora você pode reexecutar “Sincronizar ACGIH/BEI” na Biblioteca Risco × Exame.'}
              </Alert>
            )}

            <Divider sx={{ my: 1.5 }} />

            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              Itens analisados
            </Typography>
            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
              {view.items.map((item) => {
                const candidates =
                  item.candidates?.map((c) => `${c.examName} (#${c.examId})`) ??
                  [];
                const secondary = [
                  `Determinante: ${item.determinant || '—'} · Matriz: ${
                    item.matrix || '—'
                  }`,
                  item.examName ? `Exame: ${item.examName}` : null,
                  item.reason ? reasonLabel[item.reason] ?? item.reason : null,
                  candidates.length
                    ? `Candidatos: ${candidates.join('; ')}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' — ');

                return (
                  <ListItem
                    key={item.indicatorId}
                    sx={{ alignItems: 'flex-start' }}
                    secondaryAction={
                      <Chip
                        size="small"
                        color={actionColor[item.action]}
                        label={actionLabel[item.action]}
                      />
                    }
                  >
                    <ListItemText
                      primary={item.substanceName}
                      secondary={secondary}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                );
              })}
            </List>
          </>
        )}

        {sync.isError && (
          <Alert severity="error" sx={{ mt: 1.5 }}>
            Não foi possível executar o vínculo de exames ACGIH/BEI. Verifique o
            estado da correlação e tente novamente.
          </Alert>
        )}

        {!isResult && preview && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" sx={{ mb: 1 }}>
              Para confirmar a criação dos vínculos, digite exatamente{' '}
              <strong>{ACGIH_EXAM_LINK_SYNC_CONFIRM_TEXT}</strong>:
            </Typography>
            <TextField
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              size="small"
              fullWidth
              placeholder={ACGIH_EXAM_LINK_SYNC_CONFIRM_TEXT}
              disabled={sync.isPending}
              autoComplete="off"
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={sync.isPending}>
          {isResult ? 'Fechar' : 'Cancelar'}
        </Button>
        {!isResult && (
          <Button variant="contained" onClick={handleConfirm} disabled={!canConfirm}>
            {sync.isPending && !!preview ? 'Vinculando…' : 'Vincular exames'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
