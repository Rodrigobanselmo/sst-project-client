import { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { useMutateRenameRecMed } from '@v2/services/security/action-plan/rec-med/hooks/useMutateRenameRecMed';

type ActionPlanRecommendationRenameDialogProps = {
  companyId: string;
  row: ActionPlanBrowseResultModel | null;
  onClose: () => void;
};

export function ActionPlanRecommendationRenameDialog({
  companyId,
  row,
  onClose,
}: ActionPlanRecommendationRenameDialogProps) {
  const [value, setValue] = useState('');
  const rename = useMutateRenameRecMed();

  useEffect(() => {
    setValue(row?.recommendation.name ?? '');
  }, [row]);

  const trimmed = value.trim();
  const current = row?.recommendation.name.trim() ?? '';
  const canSave = !!row && trimmed.length > 0 && trimmed !== current;

  const handleSave = async () => {
    if (!row || !canSave) return;
    await rename.mutateAsync({
      recMedId: row.uuid.recommendationId,
      recName: trimmed,
      companyId,
    });
    onClose();
  };

  return (
    <Dialog open={!!row} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar texto da recomendação</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={3}
          margin="dense"
          label="Recomendação"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={rename.isPending}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={rename.isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canSave || rename.isPending}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
