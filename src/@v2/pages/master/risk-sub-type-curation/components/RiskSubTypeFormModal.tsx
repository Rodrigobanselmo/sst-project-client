import { FC } from 'react';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import type { IRiskSubTypeMasterItem } from '@v2/services/security/risk/sub-type/risk-sub-type-master/risk-sub-type-master.types';
import { RiskMap } from 'project/enum/risk.enums';
import { StatusEnum } from 'project/enum/status.enum';

type Props = {
  open: boolean;
  onClose: () => void;
  riskType: RiskTypeEnum;
  editing?: IRiskSubTypeMasterItem | null;
  onSubmit: (values: {
    name: string;
    description?: string;
    status?: StatusEnum;
  }) => void;
  loading?: boolean;
};

export const RiskSubTypeFormModal: FC<Props> = ({
  open,
  onClose,
  riskType,
  editing,
  onSubmit,
  loading,
}) => {
  const isSystem = Boolean(editing?.system);
  const typeLabel = RiskMap[riskType]?.name ?? riskType;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editing ? 'Editar subtipo' : 'Criar subtipo'}
      </DialogTitle>
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const formData = new FormData(form);
          onSubmit({
            name: String(formData.get('name') ?? '').trim(),
            description: String(formData.get('description') ?? '').trim() || undefined,
            status: (formData.get('status') as StatusEnum) || undefined,
          });
        }}
      >
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Tipo de risco: <strong>{typeLabel}</strong>
          </Typography>
          {isSystem && (
            <Chip size="small" label="Padrão do sistema" color="default" />
          )}
          <TextField
            name="name"
            label="Nome"
            required
            fullWidth
            size="small"
            defaultValue={editing?.name ?? ''}
            disabled={isSystem}
            helperText={
              isSystem
                ? 'Subtipos do sistema não podem ter o nome alterado.'
                : undefined
            }
          />
          <TextField
            name="description"
            label="Descrição"
            fullWidth
            size="small"
            multiline
            minRows={2}
            defaultValue={editing?.description ?? ''}
          />
          {editing && (
            <TextField
              name="status"
              label="Status"
              select
              fullWidth
              size="small"
              defaultValue={editing.status}
            >
              <MenuItem value={StatusEnum.ACTIVE}>Ativo</MenuItem>
              <MenuItem value={StatusEnum.INACTIVE}>Inativo</MenuItem>
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Salvar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
