import { useEffect, useState } from 'react';

import {
  Alert,
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
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoleEnum } from 'project/enum/roles.enums';

import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';
import { useMutateRiskInventoryColumns } from '@v2/services/security/risk-inventory/useMutateRiskInventoryColumns';
import { useMutateSystemRiskInventoryColumns } from '@v2/services/security/risk-inventory/useMutateSystemRiskInventoryColumns';
import {
  RISK_INVENTORY_OPTIONAL_DOCX_RENDERERS_READY,
  RiskInventoryColumnOrientation,
  RiskInventoryColumnsPreference,
  RiskInventoryColumnsSource,
  RiskInventoryOptionalColumnKey,
  RiskInventoryOptionalColumnSetting,
} from '@v2/services/security/risk-inventory/risk-inventory.types';

import {
  INVENTORY_OPTIONAL_COLUMNS,
  INVENTORY_WIDTH_WEIGHT_MAX,
  INVENTORY_WIDTH_WEIGHT_MIN,
  InventoryTitleChoice,
  inventoryNativeColumnSettings,
  inventoryOptionalColumnWidthWeight,
  inventoryOptionalDefaultSetting,
  inventoryWidthPercent,
  reconcileInventoryColumnOrder,
} from './risk-inventory.presentation';

type RiskInventoryOptionalColumnsDialogProps = {
  open: boolean;
  companyId: string;
  workspaceId: string;
  columnPreference: RiskInventoryColumnsPreference | null;
  columnPreferenceSource: RiskInventoryColumnsSource;
  onClose: () => void;
};

export function RiskInventoryOptionalColumnsDialog({
  open,
  companyId,
  workspaceId,
  columnPreference,
  columnPreferenceSource,
  onClose,
}: RiskInventoryOptionalColumnsDialogProps) {
  const mutation = useMutateRiskInventoryColumns();
  const systemMutation = useMutateSystemRiskInventoryColumns();
  const { showSnackBar } = useSystemSnackbar();
  const [systemNotice, setSystemNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState<RiskInventoryOptionalColumnSetting[]>(
    () => columnPreference?.optionalColumns ?? [],
  );

  useEffect(() => {
    if (!open) return;
    setDraft(columnPreference?.optionalColumns ?? []);
  }, [open, columnPreference, workspaceId]);

  useEffect(() => {
    if (open) setSystemNotice(null);
  }, [open, workspaceId]);

  const busy = mutation.isPending || systemMutation.isPending;

  const nativeWeight = inventoryNativeColumnSettings(columnPreference)
    .filter((column) => column.visible !== false || !('visible' in column))
    .reduce((sum, column) => sum + (column.widthWeight ?? 0), 0);
  const visibleOptionalWeight = draft.reduce((sum, column) => {
    if (column.visible !== true) return sum;
    return sum + inventoryOptionalColumnWidthWeight(column);
  }, 0);
  const weightTotal = Math.max(nativeWeight + visibleOptionalWeight, 1);

  const columnOrderFor = (optionalColumns: RiskInventoryOptionalColumnSetting[]) =>
    reconcileInventoryColumnOrder(
      columnPreference?.columnOrder,
      (columnPreference?.extraColumns ?? []).map((column) => column.key),
      optionalColumns.map((column) => column.key),
    );

  const save = (
    columns: RiskInventoryColumnsPreference['columns'] | null,
    optionalColumns?: RiskInventoryOptionalColumnSetting[],
  ) => {
    mutation.mutate(
      {
        companyId,
        workspaceId,
        columns,
        extraColumns: columns === null ? undefined : (columnPreference?.extraColumns ?? []),
        optionalColumns,
        columnOrder: columns === null ? undefined : columnOrderFor(optionalColumns ?? []),
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
        optionalColumns: draft,
        columnOrder: columnOrderFor(draft),
      },
      {
        onSuccess: () => {
          const message =
            'Padrão do sistema atualizado. A personalização deste estabelecimento não foi gravada por esta ação.';
          setSystemNotice(message);
          showSnackBar('Padrão do sistema atualizado.', { type: 'success' });
        },
        onError: () => {
          showSnackBar('Não foi possível atualizar o padrão do sistema.', { type: 'error' });
        },
      },
    );
  };

  const include = (key: RiskInventoryOptionalColumnKey, checked: boolean) => {
    setDraft((current) => {
      if (!checked) return current.filter((column) => column.key !== key);
      if (current.some((column) => column.key === key)) return current;
      return [...current, inventoryOptionalDefaultSetting(key)];
    });
  };

  const patch = (key: RiskInventoryOptionalColumnKey, partial: Partial<RiskInventoryOptionalColumnSetting>) => {
    setDraft((current) => current.map((column) => (column.key === key ? { ...column, ...partial } : column)));
  };

  const rows = INVENTORY_OPTIONAL_COLUMNS.map((catalog) => {
    const setting = draft.find((column) => column.key === catalog.key) ?? null;
    return { catalog, setting, included: Boolean(setting) };
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Colunas opcionais</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Critérios da estimativa qualitativa de probabilidade adotados na avaliação. Os valores vêm do snapshot
          persistido do risco — não são recalculados ao abrir o inventário. São opt-in: sem configuração, nenhuma
          aparece na tela nem no Word. Marque Incluir e ative Tela e/ou Word conforme necessário. Orientação, título
          e largura usam o mesmo mecanismo das demais colunas. A posição entre as demais fica em Organizar colunas.
          Não se misturam com as Colunas extras.
        </Typography>
        {columnPreferenceSource === 'workspace' ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Este estabelecimento tem personalização própria. Salvar altera só ele.
          </Alert>
        ) : null}
        {columnPreferenceSource === 'global' ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Este estabelecimento está usando o padrão do sistema. Salvar passa a guardá-lo como personalização
            própria.
          </Alert>
        ) : null}
        {systemNotice ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {systemNotice}
          </Alert>
        ) : null}
        <Stack spacing={1.5}>
          {rows.map(({ catalog, setting, included }) => {
            const titleChoice: InventoryTitleChoice = setting?.headerOrientation ?? 'SAME';
            const onScreen = setting?.visible === true;
            return (
              <Stack key={catalog.key} spacing={0.5}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, flex: '1 1 260px' }}>
                    {catalog.headerLabel}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={included}
                        onChange={(event) => include(catalog.key, event.target.checked)}
                        inputProps={{ 'aria-label': `Incluir ${catalog.headerLabel}` }}
                      />
                    }
                    label="Incluir"
                  />
                  {setting ? (
                    <>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={onScreen}
                            onChange={(event) => patch(catalog.key, { visible: event.target.checked })}
                            inputProps={{ 'aria-label': `Tela: ${catalog.headerLabel}` }}
                          />
                        }
                        label="Tela"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={setting.includeInDocx === true}
                            disabled={!RISK_INVENTORY_OPTIONAL_DOCX_RENDERERS_READY}
                            onChange={(event) =>
                              patch(catalog.key, { includeInDocx: event.target.checked })
                            }
                            inputProps={{ 'aria-label': `Word: ${catalog.headerLabel}` }}
                          />
                        }
                        label="Word"
                      />
                    </>
                  ) : null}
                </Stack>
                {setting ? (
                  <>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        Conteúdo
                      </Typography>
                      <RadioGroup
                        row
                        value={setting.orientation}
                        onChange={(event) =>
                          patch(catalog.key, {
                            orientation: event.target.value as RiskInventoryColumnOrientation,
                          })
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
                        value={titleChoice}
                        onChange={(event) => {
                          const title = event.target.value as InventoryTitleChoice;
                          patch(catalog.key, {
                            headerOrientation: title === 'SAME' ? undefined : title,
                          });
                        }}
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="SAME">Igual</MenuItem>
                        <MenuItem value="HORIZONTAL">Horizontal</MenuItem>
                        <MenuItem value="VERTICAL">Vertical</MenuItem>
                      </Select>
                      <Typography variant="caption" color="text.secondary">
                        Largura
                      </Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={inventoryOptionalColumnWidthWeight(setting)}
                        inputProps={{
                          min: INVENTORY_WIDTH_WEIGHT_MIN,
                          max: INVENTORY_WIDTH_WEIGHT_MAX,
                          step: 1,
                          'aria-label': `Largura de ${catalog.headerLabel}`,
                        }}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          if (!Number.isInteger(next)) return;
                          if (next < INVENTORY_WIDTH_WEIGHT_MIN || next > INVENTORY_WIDTH_WEIGHT_MAX) return;
                          patch(catalog.key, { widthWeight: next });
                        }}
                        sx={{ width: 72 }}
                      />
                      <Typography variant="caption" sx={{ minWidth: 52 }}>
                        {onScreen
                          ? `${new Intl.NumberFormat('pt-BR', {
                              maximumFractionDigits: 1,
                              minimumFractionDigits: 1,
                            }).format(
                              inventoryWidthPercent(inventoryOptionalColumnWidthWeight(setting), weightTotal),
                            )}%`
                          : 'oculta'}
                      </Typography>
                    </Stack>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Título personalizado"
                      value={setting.headerLabel ?? ''}
                      inputProps={{ maxLength: 80, 'aria-label': `Título de ${catalog.headerLabel}` }}
                      onChange={(event) =>
                        patch(catalog.key, {
                          headerLabel: event.target.value
                            .replace(/[\u0000-\u001F\u007F\u2028\u2029]/g, '')
                            .slice(0, 80),
                        })
                      }
                    />
                  </>
                ) : null}
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
