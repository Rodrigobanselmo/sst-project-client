import { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ParagraphEnum } from 'project/enum/paragraph.enum';

export type TechnicalContentArrayField =
  | 'paragraphs'
  | 'activities'
  | 'considerations';

type Props = {
  open: boolean;
  title: string;
  values: string[];
  defaultType: ParagraphEnum;
  onClose: () => void;
  onSave: (next: string[]) => Promise<void> | void;
  saving?: boolean;
};

type DraftLine = { text: string; type: ParagraphEnum };

function parseLines(values: string[], defaultType: ParagraphEnum): DraftLine[] {
  if (!values.length) return [{ text: '', type: defaultType }];
  return values.map((raw) => {
    const [text, type] = String(raw).split('{type}=');
    return {
      text: text || '',
      type: (type as ParagraphEnum) || defaultType,
    };
  });
}

function toStored(lines: DraftLine[]): string[] {
  return lines
    .map((line) => ({
      text: line.text.trim(),
      type: line.type,
    }))
    .filter((line) => line.text.length > 0)
    .map((line) => `${line.text}{type}=${line.type}`);
}

/**
 * Editor compacto de um único campo-array (Descrição / Processos / Considerações).
 */
export function CharacterizationTechnicalContentArrayEditorDialog({
  open,
  title,
  values,
  defaultType,
  onClose,
  onSave,
  saving = false,
}: Props) {
  const [lines, setLines] = useState<DraftLine[]>(() =>
    parseLines(values, defaultType),
  );

  useEffect(() => {
    if (!open) return;
    setLines(parseLines(values, defaultType));
  }, [open, values, defaultType]);

  const canSave = useMemo(
    () => toStored(lines).join('\0') !== (values || []).join('\0'),
    [lines, values],
  );

  const handleSave = async () => {
    await onSave(toStored(lines));
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={1.5}>
          {lines.map((line, index) => (
            <Box key={index} display="flex" gap={1} alignItems="flex-start">
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={line.text}
                disabled={saving}
                onChange={(e) => {
                  const text = e.target.value;
                  setLines((prev) =>
                    prev.map((item, i) => (i === index ? { ...item, text } : item)),
                  );
                }}
                placeholder="Escreva o conteúdo…"
              />
              <IconButton
                size="small"
                disabled={saving || lines.length <= 1}
                onClick={() =>
                  setLines((prev) => prev.filter((_, i) => i !== index))
                }
                aria-label="Remover item"
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={() =>
              setLines((prev) => [...prev, { text: '', type: defaultType }])
            }
            disabled={saving}
            sx={{ alignSelf: 'flex-start' }}
          >
            Adicionar
          </Button>
          <Typography variant="caption" color="text.secondary">
            Salvar aplica imediatamente e atualiza a tabela. Cancelar descarta
            alterações não salvas deste campo.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={saving || !canSave}
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
