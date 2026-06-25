import { FC, useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { BIOLOGICAL_INDICATOR_APPLY_CONFIRM_TEXT } from '@v2/services/medicine/biological-indicator/service/biological-indicator-maintenance.service';

type Props = {
  open: boolean;
  isApplying: boolean;
  summary: {
    new: number;
    updated: number;
    deprecated: number;
  };
  onClose: () => void;
  onConfirm: () => void;
};

const SummaryRow: FC<{ label: string; value: number }> = ({ label, value }) => (
  <Box display="flex" justifyContent="space-between">
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value}
    </Typography>
  </Box>
);

export const ApplyConfirmDialog: FC<Props> = ({
  open,
  isApplying,
  summary,
  onClose,
  onConfirm,
}) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!open) setText('');
  }, [open]);

  const isMatch = text.trim() === BIOLOGICAL_INDICATOR_APPLY_CONFIRM_TEXT;

  return (
    <Dialog open={open} onClose={isApplying ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Aplicar atualização normativa NR-07</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <SummaryRow label="Novos indicadores" value={summary.new} />
            <SummaryRow label="Indicadores alterados" value={summary.updated} />
            <SummaryRow
              label="Candidatos a obsoletos"
              value={summary.deprecated}
            />
          </Box>

          <Alert severity="warning">
            Indicadores ativos alterados voltarão para Rascunho e exigirão nova
            revisão. Os candidatos a obsoletos serão marcados como Depreciados.
          </Alert>

          <Alert severity="info">
            Nenhuma aplicação será feita no PCMSO, em ExamToRisk ou em dados
            operacionais. Apenas a base normativa NR-07 será atualizada.
          </Alert>

          <Box>
            <Typography variant="body2" gutterBottom>
              Para confirmar, digite{' '}
              <strong>{BIOLOGICAL_INDICATOR_APPLY_CONFIRM_TEXT}</strong>:
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={BIOLOGICAL_INDICATOR_APPLY_CONFIRM_TEXT}
              disabled={isApplying}
              autoComplete="off"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isApplying}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={onConfirm}
          disabled={!isMatch || isApplying}
        >
          {isApplying ? 'Aplicando...' : 'Confirmar aplicação'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
