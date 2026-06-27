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
import { ESOCIAL_PROCEDURE_APPLY_CONFIRM_TEXT } from '@v2/services/medicine/esocial-procedure/service/esocial-procedure-maintenance.service';

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

export const EsocialProcedureApplyConfirmDialog: FC<Props> = ({
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

  const isMatch = text.trim() === ESOCIAL_PROCEDURE_APPLY_CONFIRM_TEXT;

  return (
    <Dialog
      open={open}
      onClose={isApplying ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Aplicar curadoria da Tabela 27</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <SummaryRow label="Curadorias a criar" value={summary.created} />
            <SummaryRow label="Curadorias a atualizar" value={summary.updated} />
          </Box>

          <Alert severity="info">
            A aplicação grava somente na camada de curadoria SimpleSST
            (PcmsoEsocialProcedure). A Tabela 27 oficial do eSocial, eventos
            S-2220/S-2240, XML, Exam e ExamToRisk não são alterados.
          </Alert>

          <Box>
            <Typography variant="body2" gutterBottom>
              Para confirmar, digite{' '}
              <strong>{ESOCIAL_PROCEDURE_APPLY_CONFIRM_TEXT}</strong>:
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={ESOCIAL_PROCEDURE_APPLY_CONFIRM_TEXT}
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
