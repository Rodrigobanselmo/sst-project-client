import { FC } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

export type RiskFactorAiSuggestionApplyMode = 'replace' | 'merge';

type RiskFactorAiSuggestionApplyDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (mode: RiskFactorAiSuggestionApplyMode) => void;
};

export const RiskFactorAiSuggestionApplyDialog: FC<
  RiskFactorAiSuggestionApplyDialogProps
> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Substituir campos preenchidos?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Já existem valores em Risco, Sintomas ou Severidade. Escolha como aplicar
          a sugestão da IA.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Em ambas as opções, a severidade sugerida pela IA será aplicada aos
          botões de severidade.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onConfirm('merge')} variant="outlined">
          Mesclar
        </Button>
        <Button onClick={() => onConfirm('replace')} variant="contained">
          Substituir
        </Button>
      </DialogActions>
    </Dialog>
  );
};
