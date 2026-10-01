import { useEffect, useState } from 'react';

import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoleEnum } from 'project/enum/roles.enums';

import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';
import { useMutateRiskInventoryColumns } from '@v2/services/security/risk-inventory/useMutateRiskInventoryColumns';
import { useMutateSystemRiskInventoryColumns } from '@v2/services/security/risk-inventory/useMutateSystemRiskInventoryColumns';
import {
  RiskInventoryColumnKey,
  RiskInventoryColumnsPreference,
  RiskInventoryColumnsSource,
  RiskInventoryOrderKey,
} from '@v2/services/security/risk-inventory/risk-inventory.types';

import {
  inventoryDefaultColumnLabel,
  inventoryExtraColumnLabel,
  inventoryNativeColumnSettings,
  inventoryOrderColumnVisible,
  resolveInventoryColumnOrder,
  INVENTORY_CANONICAL_COLUMN_ORDER,
} from './risk-inventory.presentation';

type RiskInventoryColumnOrderDialogProps = {
  open: boolean;
  companyId: string;
  workspaceId: string;
  columnPreference: RiskInventoryColumnsPreference | null;
  columnPreferenceSource: RiskInventoryColumnsSource;
  onClose: () => void;
};

export function RiskInventoryColumnOrderDialog({
  open,
  companyId,
  workspaceId,
  columnPreference,
  columnPreferenceSource,
  onClose,
}: RiskInventoryColumnOrderDialogProps) {
  const mutation = useMutateRiskInventoryColumns();
  const systemMutation = useMutateSystemRiskInventoryColumns();
  const { showSnackBar } = useSystemSnackbar();
  const [systemNotice, setSystemNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState<RiskInventoryOrderKey[]>(() => resolveInventoryColumnOrder(columnPreference));
  const busy = mutation.isPending || systemMutation.isPending;

  useEffect(() => {
    if (!open) return;
    setSystemNotice(null);
    setDraft(resolveInventoryColumnOrder(columnPreference));
  }, [open, columnPreference, workspaceId]);

  const save = (columns: RiskInventoryColumnsPreference['columns'] | null, columnOrder?: RiskInventoryOrderKey[]) => {
    mutation.mutate(
      {
        companyId,
        workspaceId,
        columns,
        extraColumns: columns === null ? undefined : (columnPreference?.extraColumns ?? []),
        columnOrder,
      },
      { onSuccess: () => onClose() },
    );
  };
  const defineSystemDefault = () => {
    systemMutation.mutate(
      {
        companyId,
        workspaceId,
        columns: inventoryNativeColumnSettings(columnPreference),
        extraColumns: columnPreference?.extraColumns ?? [],
        columnOrder: draft,
      },
      {
        onSuccess: () => {
          setSystemNotice(
            'Padrão do sistema atualizado. A personalização deste estabelecimento não foi gravada por esta ação.',
          );
          showSnackBar('Padrão do sistema atualizado.', { type: 'success' });
        },
        onError: () => {
          showSnackBar('Não foi possível atualizar o padrão do sistema.', { type: 'error' });
        },
      },
    );
  };
  const move = (key: RiskInventoryOrderKey, delta: number) => {
    setDraft((current) => {
      const index = current.indexOf(key);
      const next = index + delta;
      if (index < 0 || next < 0 || next >= current.length) return current;
      const copy = current.slice();
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  };
  const labelFor = (key: RiskInventoryOrderKey) => {
    const extra = columnPreference?.extraColumns?.find((column) => column.key === key);
    if (extra) return inventoryExtraColumnLabel(extra);
    if ((INVENTORY_CANONICAL_COLUMN_ORDER as readonly string[]).includes(key)) {
      const saved = columnPreference?.columns.find((column) => column.key === key)?.headerLabel;
      return saved || inventoryDefaultColumnLabel(key as RiskInventoryColumnKey);
    }
    return key;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Organizar colunas</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A lista reúne as colunas nativas e as extras já incluídas. Subir e Descer mudam somente a ordem.
          Visibilidade, título, orientação, largura e a inclusão da extra continuam nos outros diálogos.
        </Typography>
        {columnPreferenceSource === 'workspace' ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Este estabelecimento tem personalização própria. Salvar altera só ele.
          </Alert>
        ) : null}
        {columnPreferenceSource === 'global' ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Este estabelecimento está usando o padrão do sistema. Salvar passa a guardá-lo como personalização própria.
          </Alert>
        ) : null}
        {systemNotice ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {systemNotice}
          </Alert>
        ) : null}
        <Stack spacing={0.75}>
          {draft.map((key) => {
            const hidden = !inventoryOrderColumnVisible(columnPreference, key);
            return (
              <Stack
                key={key}
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {labelFor(key)}
                  {hidden ? (
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      oculta
                    </Typography>
                  ) : null}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" disabled={draft[0] === key} onClick={() => move(key, -1)}>
                    Subir
                  </Button>
                  <Button size="small" disabled={draft[draft.length - 1] === key} onClick={() => move(key, 1)}>
                    Descer
                  </Button>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button color="inherit" disabled={busy} onClick={() => save(null)}>
            Restaurar padrão
          </Button>
          <SAuthShow roles={[RoleEnum.MASTER]}>
            <Button color="inherit" disabled={busy} onClick={defineSystemDefault}>
              Definir como padrão do sistema
            </Button>
          </SAuthShow>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={busy}
            onClick={() => save(columnPreference?.columns ?? [], draft)}
          >
            Salvar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
