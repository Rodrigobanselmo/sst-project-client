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
import { useConfirmSafeAcgihExamLinks } from '@v2/services/medicine/acgih-risk-correlation/hooks/useConfirmSafeAcgihExamLinks';
import {
  ACGIH_EXAM_LINK_CONFIRM_SAFE_PENDING_TEXT,
  AcgihExamConfirmSafeAction,
  IAcgihExamConfirmSafeResponse,
} from '@v2/services/medicine/acgih-risk-correlation/service/acgih-risk-correlation.types';

type Props = {
  open: boolean;
  onClose: () => void;
};

const actionColor: Record<
  AcgihExamConfirmSafeAction,
  'success' | 'info' | 'warning' | 'error'
> = {
  confirmed: 'success',
  alreadyConfirmed: 'info',
  skipped: 'warning',
  failed: 'error',
};

const actionLabel: Record<AcgihExamConfirmSafeAction, string> = {
  confirmed: 'Confirmado',
  alreadyConfirmed: 'Já confirmado',
  skipped: 'Mantido pendente',
  failed: 'Falhou',
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
 * Confirma vínculos ACGIH/BEI → Exame pendentes que passam na regra segura
 * determinante + matriz embutida no nome do exame. Não cria regra da Biblioteca.
 */
export const AcgihExamConfirmSafeDialog: FC<Props> = ({ open, onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [preview, setPreview] = useState<IAcgihExamConfirmSafeResponse | null>(
    null,
  );
  const [result, setResult] = useState<IAcgihExamConfirmSafeResponse | null>(
    null,
  );
  const confirmSafe = useConfirmSafeAcgihExamLinks();

  useEffect(() => {
    if (!open) {
      setConfirmText('');
      setPreview(null);
      setResult(null);
      confirmSafe.reset();
      return;
    }
    confirmSafe.mutate(
      {
        confirmText: ACGIH_EXAM_LINK_CONFIRM_SAFE_PENDING_TEXT,
        dryRun: true,
      },
      { onSuccess: (data) => setPreview(data) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canConfirm = useMemo(
    () =>
      confirmText.trim() === ACGIH_EXAM_LINK_CONFIRM_SAFE_PENDING_TEXT &&
      !confirmSafe.isPending &&
      !!preview &&
      preview.totals.confirmed > 0,
    [confirmText, confirmSafe.isPending, preview],
  );

  const handleConfirm = () => {
    if (!canConfirm) return;
    confirmSafe.mutate(
      {
        confirmText: ACGIH_EXAM_LINK_CONFIRM_SAFE_PENDING_TEXT,
        dryRun: false,
      },
      { onSuccess: (data) => setResult(data) },
    );
  };

  const handleClose = () => {
    if (confirmSafe.isPending) return;
    onClose();
  };

  const view = result ?? preview;
  const isResult = !!result;
  const isLoadingPreview = !preview && confirmSafe.isPending && !result;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isResult
          ? 'Confirmar pendentes seguros — resultado'
          : 'Confirmar pendentes seguros'}
      </DialogTitle>
      <DialogContent dividers>
        {isLoadingPreview && (
          <Box display="flex" alignItems="center" gap={1.5} py={3}>
            <CircularProgress size={20} />
            <Typography variant="body2">Gerando prévia (sem escrita)…</Typography>
          </Box>
        )}

        {!isResult && preview && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Confirma apenas vínculos pendentes em que o{' '}
            <strong>determinante ACGIH</strong> casa de forma forte com o exame e
            a <strong>matriz/coleta</strong> está embutida no nome ou material
            (ex.: determinante + urina ↔ exame “na urina”). Não cria exame, não
            cria regra na Biblioteca e não altera vínculos de risco. Itens
            duvidosos ou ambíguos permanecem pendentes.
          </Alert>
        )}

        {view && (
          <>
            <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
              <Count label="Pendentes avaliados" value={view.totals.pending} />
              <Count
                label={isResult ? 'Confirmados' : 'A confirmar'}
                value={view.totals.confirmed}
              />
              <Count label="Mantidos pendentes" value={view.totals.skipped} />
              <Count label="Já confirmados" value={view.totals.alreadyConfirmed} />
              <Count label="Falhas" value={view.totals.failed} />
            </Box>

            {isResult && (
              <Alert
                severity={view.totals.failed > 0 ? 'warning' : 'success'}
                sx={{ mb: 1.5 }}
              >
                {view.totals.confirmed} vínculo(s) confirmado(s).{' '}
                {view.totals.skipped > 0 &&
                  `${view.totals.skipped} permanece(m) pendente(s) para revisão manual.`}
              </Alert>
            )}

            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" gutterBottom>
              Detalhe por indicador
            </Typography>
            <List dense disablePadding sx={{ maxHeight: 280, overflow: 'auto' }}>
              {view.items.map((item) => (
                <ListItem key={item.indicatorId} disableGutters>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography variant="body2" fontWeight={500}>
                          {item.substanceName}
                        </Typography>
                        <Chip
                          size="small"
                          label={actionLabel[item.action]}
                          color={actionColor[item.action]}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        {item.determinant} · {item.matrix}
                        {item.examName ? ` → ${item.examName}` : ''}
                        {item.reason ? ` (${item.reason})` : ''}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {!isResult && preview && (
          <TextField
            fullWidth
            margin="normal"
            label={`Digite "${ACGIH_EXAM_LINK_CONFIRM_SAFE_PENDING_TEXT}" para confirmar`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={confirmSafe.isPending}
            autoComplete="off"
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={confirmSafe.isPending}>
          {isResult ? 'Fechar' : 'Cancelar'}
        </Button>
        {!isResult && (
          <Button
            variant="contained"
            color="primary"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {confirmSafe.isPending ? 'Processando…' : 'Confirmar pendentes seguros'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
