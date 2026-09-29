import { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import { useMutateRiskInventoryColumns } from '@v2/services/security/risk-inventory/useMutateRiskInventoryColumns';
import {
  RiskInventoryColumnOrientation,
  RiskInventoryColumnSetting,
  RiskInventoryColumnsPreference,
  RiskInventoryConfigurableColumnKey,
} from '@v2/services/security/risk-inventory/risk-inventory.types';

import {
  inventoryColumnDraftHeaderChoice,
  inventoryColumnDraftOrientation,
  InventoryTitleChoice,
  INVENTORY_CONFIGURABLE_COLUMNS,
} from './risk-inventory.presentation';

type RiskInventoryColumnsDialogProps = {
  open: boolean;
  companyId: string;
  workspaceId: string;
  columnPreference: RiskInventoryColumnsPreference | null;
  onClose: () => void;
};

export function RiskInventoryColumnsDialog({
  open,
  companyId,
  workspaceId,
  columnPreference,
  onClose,
}: RiskInventoryColumnsDialogProps) {
  const mutation = useMutateRiskInventoryColumns();
  const [draft, setDraft] = useState<Record<RiskInventoryConfigurableColumnKey, RiskInventoryColumnOrientation>>(
    () => draftFrom(columnPreference),
  );
  const [titleDraft, setTitleDraft] = useState<Record<RiskInventoryConfigurableColumnKey, InventoryTitleChoice>>(
    () => titleDraftFrom(columnPreference),
  );

  useEffect(() => {
    if (open) {
      setDraft(draftFrom(columnPreference));
      setTitleDraft(titleDraftFrom(columnPreference));
    }
  }, [open, columnPreference, workspaceId]);

  const save = (columns: RiskInventoryColumnSetting[] | null) => {
    mutation.mutate(
      { companyId, workspaceId, columns },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Configurar colunas</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sem configuração salva, a tela permanece horizontal e o Word mantém Tipo, Risco Real e
          Risco Residual na vertical. Salvar aplica a escolha abaixo na tela e no próximo PGR deste
          estabelecimento.
        </Typography>
        <Stack spacing={1.25}>
          {INVENTORY_CONFIGURABLE_COLUMNS.map((column) => (
            <Stack
              key={column.key}
              direction="row"
              spacing={2}
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 120 }}>
                {column.label}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Conteúdo
                </Typography>
                <RadioGroup
                  row
                  value={draft[column.key]}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [column.key]: event.target.value as RiskInventoryColumnOrientation,
                    }))
                  }
                >
                  <FormControlLabel value="HORIZONTAL" control={<Radio size="small" />} label="Horizontal" />
                  <FormControlLabel value="VERTICAL" control={<Radio size="small" />} label="Vertical" />
                </RadioGroup>
                <Typography variant="caption" color="text.secondary">
                  Título
                </Typography>
                <Select
                  size="small"
                  value={titleDraft[column.key]}
                  onChange={(event) =>
                    setTitleDraft((current) => ({
                      ...current,
                      [column.key]: event.target.value as InventoryTitleChoice,
                    }))
                  }
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="SAME">Igual</MenuItem>
                  <MenuItem value="HORIZONTAL">Horizontal</MenuItem>
                  <MenuItem value="VERTICAL">Vertical</MenuItem>
                </Select>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button
          color="inherit"
          disabled={mutation.isPending}
          onClick={() => save(null)}
        >
          Restaurar padrão
        </Button>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={mutation.isPending}
            onClick={() =>
              save(
                INVENTORY_CONFIGURABLE_COLUMNS.map((column) =>
                  columnSetting(column.key, draft[column.key], titleDraft[column.key]),
                ),
              )
            }
          >
            Salvar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

function draftFrom(preference: RiskInventoryColumnsPreference | null) {
  return Object.fromEntries(
    INVENTORY_CONFIGURABLE_COLUMNS.map((column) => [
      column.key,
      inventoryColumnDraftOrientation(preference, column.key),
    ]),
  ) as Record<RiskInventoryConfigurableColumnKey, RiskInventoryColumnOrientation>;
}

function columnSetting(
  key: RiskInventoryConfigurableColumnKey,
  orientation: RiskInventoryColumnOrientation,
  title: InventoryTitleChoice,
): RiskInventoryColumnSetting {
  if (title === 'SAME') return { key, orientation };
  return { key, orientation, headerOrientation: title };
}

function titleDraftFrom(preference: RiskInventoryColumnsPreference | null) {
  return Object.fromEntries(
    INVENTORY_CONFIGURABLE_COLUMNS.map((column) => [
      column.key,
      inventoryColumnDraftHeaderChoice(preference, column.key),
    ]),
  ) as Record<RiskInventoryConfigurableColumnKey, InventoryTitleChoice>;
}
