import { FormEvent, useEffect, useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { CharacterizationBrowseResultModel } from '@v2/models/security/models/characterization/characterization-browse-result.model';
import { CharacterizationTypeEnum } from '@v2/models/security/enums/characterization-type.enum';
import { CharacterizationTypeMap } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/maps/characterization-type-map';
import { useMutUpsertCharacterization } from 'core/services/hooks/mutations/manager/useMutUpsertCharacterization';
import { getIsEnvironment } from 'project/enum/characterization-type.enum';

import { invalidateCharacterizationInventory } from './invalidate-characterization-inventory';

type RenameDialogProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  row: CharacterizationBrowseResultModel | null;
};

export function CharacterizationRenameDialog({
  open,
  onClose,
  companyId,
  workspaceId,
  row,
}: RenameDialogProps) {
  const upsertMutation = useMutUpsertCharacterization();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(row?.name || '');
      setError('');
    }
  }, [open, row?.name]);

  const onSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Informe um nome válido');
      return;
    }
    if (!row) return;

    await upsertMutation
      .mutateAsync({
        id: row.id,
        name: trimmed,
        type: row.type,
        companyId,
        workspaceId,
      })
      .then(async () => {
        await invalidateCharacterizationInventory({
          companyId,
          workspaceId,
          characterizationId: row.id,
        });
        onClose();
      })
      .catch(() => {});
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={onSubmit}>
        <DialogTitle>Renomear elemento</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Nome"
            value={name}
            error={!!error}
            helperText={error || ' '}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={upsertMutation.isLoading}
          >
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

type TypeDialogProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  row: CharacterizationBrowseResultModel | null;
};

const TYPE_OPTIONS = Object.values(CharacterizationTypeEnum);

export function CharacterizationTypeDialog({
  open,
  onClose,
  companyId,
  workspaceId,
  row,
}: TypeDialogProps) {
  const upsertMutation = useMutUpsertCharacterization();
  const [type, setType] = useState<CharacterizationTypeEnum | ''>('');

  useEffect(() => {
    if (open) setType(row?.type || '');
  }, [open, row?.type]);

  const onSave = async () => {
    if (!row || !type || type === row.type) {
      onClose();
      return;
    }

    const crossesFamily =
      getIsEnvironment(row.type) !== getIsEnvironment(type as any);

    const confirmed = window.confirm(
      crossesFamily
        ? 'Esta troca altera a família do elemento (ambiente ↔ atividade/equipamento/posto) e pode afetar a classificação no GSE. Deseja continuar?'
        : 'Alterar o tipo do elemento pode afetar classificações e vínculos. Deseja continuar?',
    );
    if (!confirmed) return;

    await upsertMutation
      .mutateAsync({
        id: row.id,
        name: row.name,
        type,
        companyId,
        workspaceId,
      })
      .then(async () => {
        await invalidateCharacterizationInventory({
          companyId,
          workspaceId,
          characterizationId: row.id,
        });
        onClose();
      })
      .catch(() => {});
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Alterar tipo</DialogTitle>
      <DialogContent>
        <TextField
          select
          fullWidth
          margin="dense"
          label="Tipo"
          value={type}
          onChange={(e) => setType(e.target.value as CharacterizationTypeEnum)}
        >
          {TYPE_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {CharacterizationTypeMap[option]?.rowLabel || option}
            </MenuItem>
          ))}
        </TextField>
        <Box mt={1} color="text.secondary" fontSize={12}>
          A alteração reutiliza o mesmo contrato da edição completa. Nenhum
          dado é apagado automaticamente.
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={upsertMutation.isLoading || !type}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
