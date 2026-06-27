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
import { ACGIH_BEI_APPLY_CONFIRM_TEXT } from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator-maintenance.service';

type Props = {
  open: boolean;
  isApplying: boolean;
  summary: {
    created: number;
    updated: number;
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

export const AcgihBeiIndicatorApplyConfirmDialog: FC<Props> = ({
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

  const isMatch = text.trim() === ACGIH_BEI_APPLY_CONFIRM_TEXT;

  return (
    <Dialog
      open={open}
      onClose={isApplying ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Aplicar curadoria ACGIH/BEI</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <SummaryRow label="Indicadores a criar" value={summary.created} />
            <SummaryRow label="Indicadores a atualizar" value={summary.updated} />
          </Box>

          <Alert severity="info">
            A aplicação grava somente na base técnica ACGIH/BEI
            (PcmsoAcgihBeiIndicator). NR-7, Tabela 27/eSocial, XML, S-2220/S-2240,
            ExamToRisk, empresas e a biblioteca Regras Exame × Risco não são
            alterados.
          </Alert>

          <Box>
            <Typography variant="body2" gutterBottom>
              Para confirmar, digite{' '}
              <strong>{ACGIH_BEI_APPLY_CONFIRM_TEXT}</strong>:
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={ACGIH_BEI_APPLY_CONFIRM_TEXT}
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
