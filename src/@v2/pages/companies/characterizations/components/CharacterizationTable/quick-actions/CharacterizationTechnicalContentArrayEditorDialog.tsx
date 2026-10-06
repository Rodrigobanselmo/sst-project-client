import { useEffect, useState } from 'react';

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { CharacterizationContentEditor } from 'components/organisms/characterization-content-editor/CharacterizationContentEditor';
import { sameCharacterizationContent } from 'components/organisms/characterization-content-editor/characterization-content.adapter';
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

/**
 * Editor compacto de um único campo-array (Descrição / Processos / Considerações).
 * `defaultType` permanece na assinatura para os chamadores atuais; o mini editor
 * não usa um tipo padrão por linha — o tipo sai da toolbar e do conteúdo já salvo.
 */
export function CharacterizationTechnicalContentArrayEditorDialog({
  open,
  title,
  values,
  defaultType: _defaultType,
  onClose,
  onSave,
  saving = false,
}: Props) {
  const [draft, setDraft] = useState(values);

  useEffect(() => {
    if (!open) return;
    setDraft(values);
  }, [open, values]);

  const changed = !sameCharacterizationContent(draft, values || []);

  const handleSave = async () => {
    await onSave(changed ? draft : values);
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={1}>
          <CharacterizationContentEditor
            key={title}
            value={values || []}
            disabled={saving}
            onChange={setDraft}
          />
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
          disabled={saving || !changed}
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
