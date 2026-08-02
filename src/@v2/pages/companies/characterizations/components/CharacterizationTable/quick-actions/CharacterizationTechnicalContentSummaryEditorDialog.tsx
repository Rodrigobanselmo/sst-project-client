import { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';

type Props = {
  open: boolean;
  title: string;
  value: string;
  maxLength?: number;
  onClose: () => void;
  onSave: (next: string) => Promise<void> | void;
  saving?: boolean;
};

/**
 * Editor compacto de texto simples (Resumo do Inventário).
 */
export function CharacterizationTechnicalContentSummaryEditorDialog({
  open,
  title,
  value,
  maxLength = 1000,
  onClose,
  onSave,
  saving = false,
}: Props) {
  const [draft, setDraft] = useState(value || '');

  useEffect(() => {
    if (!open) return;
    setDraft(value || '');
  }, [open, value]);

  const trimmed = draft.trim();
  const canSave = trimmed !== String(value || '').trim() && trimmed.length <= maxLength;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={draft}
          disabled={saving}
          onChange={(e) => setDraft(e.target.value.slice(0, maxLength))}
          placeholder="Resumo para o inventário de riscos…"
          helperText={`${draft.length}/${maxLength}`}
        />
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          O resumo é derivado de Descrição, Processos e Considerações.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={saving || !canSave}
          onClick={() => void onSave(trimmed)}
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
