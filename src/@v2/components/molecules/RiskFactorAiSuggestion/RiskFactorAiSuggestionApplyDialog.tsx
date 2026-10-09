import { FC, useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';

export type RiskFactorAiSuggestionApplyMode = 'fill-empty' | 'replace-all';

type RiskFactorAiSuggestionApplyDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (mode: RiskFactorAiSuggestionApplyMode) => void;
};

export const RiskFactorAiSuggestionApplyDialog: FC<
  RiskFactorAiSuggestionApplyDialogProps
> = ({ open, onClose, onConfirm }) => {
  const [mode, setMode] = useState<RiskFactorAiSuggestionApplyMode>('fill-empty');

  useEffect(() => {
    if (open) setMode('fill-empty');
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Aplicar sugestão da IA</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Já existem valores em Risco, Sintomas, Região atingida, Vias de absorção / entrada no organismo
          ou Severidade. A sugestão permanece no formulário até o salvamento manual.
        </Typography>
        <RadioGroup
          value={mode}
          onChange={(event) =>
            setMode(event.target.value as RiskFactorAiSuggestionApplyMode)
          }
          sx={{ mt: 2 }}
        >
          <FormControlLabel
            value="fill-empty"
            control={<Radio />}
            label="Preencher somente campos vazios"
          />
          <Typography variant="caption" color="text.secondary" sx={{ pl: 4, mb: 1 }}>
            Preserva integralmente o que já está preenchido, inclusive a severidade.
            Não concatena textos e não altera os demais campos do formulário.
          </Typography>
          <FormControlLabel
            value="replace-all"
            control={<Radio />}
            label="Atualizar todos os campos"
          />
          <Typography variant="caption" color="text.secondary" sx={{ pl: 4 }}>
            Substitui risco, sintomas, região atingida, vias de absorção e
            severidade pela sugestão. Esta opção exige confirmação.
          </Typography>
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={() => onConfirm(mode)} variant="contained">
          {mode === 'replace-all' ? 'Confirmar atualização' : 'Preencher campos vazios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
