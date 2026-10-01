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
  RiskInventoryColumnOrientation,
  RiskInventoryColumnsPreference,
  RiskInventoryColumnsSource,
  RiskInventoryExtraColumnKey,
  RiskInventoryExtraColumnSetting,
} from '@v2/services/security/risk-inventory/risk-inventory.types';

import {
  INVENTORY_EXTRA_COLUMNS,
  INVENTORY_WIDTH_WEIGHT_MAX,
  INVENTORY_WIDTH_WEIGHT_MIN,
  InventoryTitleChoice,
  inventoryExtraColumnWidthWeight,
  inventoryExtraDefaultSetting,
  inventoryNativeColumnSettings,
  reconcileInventoryColumnOrder,
  inventoryWidthPercent,
} from './risk-inventory.presentation';

type RiskInventoryExtraColumnsDialogProps = {
  open: boolean;
  companyId: string;
  workspaceId: string;
  columnPreference: RiskInventoryColumnsPreference | null;
  columnPreferenceSource: RiskInventoryColumnsSource;
  onClose: () => void;
};

export function RiskInventoryExtraColumnsDialog({
  open,
  companyId,
  workspaceId,
  columnPreference,
  columnPreferenceSource,
  onClose,
}: RiskInventoryExtraColumnsDialogProps) {
  const mutation = useMutateRiskInventoryColumns();
  const systemMutation = useMutateSystemRiskInventoryColumns();
  const { showSnackBar } = useSystemSnackbar();
  const [systemNotice, setSystemNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState<RiskInventoryExtraColumnSetting[]>(() => columnPreference?.extraColumns ?? []);

  useEffect(() => {
    if (!open) return;
    setDraft(columnPreference?.extraColumns ?? []);
  }, [open, columnPreference, workspaceId]);

  useEffect(() => {
    if (open) setSystemNotice(null);
  }, [open, workspaceId]);

  const busy = mutation.isPending || systemMutation.isPending;
  const selected = new Set(draft.map((column) => column.key));
  const nativeWeight = inventoryNativeColumnSettings(columnPreference)
    .filter((column) => column.visible !== false || !('visible' in column))
    .reduce((sum, column) => sum + (column.widthWeight ?? 0), 0);
  const visibleExtraWeight = draft.reduce((sum, column) => {
    if (column.visible === false) return sum;
    return sum + inventoryExtraColumnWidthWeight(column);
  }, 0);
  const weightTotal = nativeWeight + visibleExtraWeight;

  const columnOrderFor = (extraColumns: RiskInventoryExtraColumnSetting[]) =>
    reconcileInventoryColumnOrder(
      columnPreference?.columnOrder,
      extraColumns.map((column) => column.key),
    );
  const save = (columns: RiskInventoryColumnsPreference['columns'] | null, extraColumns?: RiskInventoryExtraColumnSetting[]) => {
    mutation.mutate(
      {
        companyId,
        workspaceId,
        columns,
        extraColumns,
        columnOrder: columns === null ? undefined : columnOrderFor(extraColumns ?? []),
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
        extraColumns: draft,
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

  const include = (key: RiskInventoryExtraColumnKey, checked: boolean) => {
    setDraft((current) => {
      if (!checked) return current.filter((column) => column.key !== key);
      if (current.some((column) => column.key === key)) return current;
      return [...current, inventoryExtraDefaultSetting(key)];
    });
  };
  const move = (key: RiskInventoryExtraColumnKey, delta: number) => {
    setDraft((current) => {
      const index = current.findIndex((column) => column.key === key);
      const next = index + delta;
      if (index < 0 || next < 0 || next >= current.length) return current;
      const copy = current.slice();
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  };
  const patch = (key: RiskInventoryExtraColumnKey, partial: Partial<RiskInventoryExtraColumnSetting>) => {
    setDraft((current) => current.map((column) => (column.key === key ? { ...column, ...partial } : column)));
  };

  const rows = [
    ...draft.map((column) => ({ key: column.key, included: true as const, column })),
    ...INVENTORY_EXTRA_COLUMNS.filter((column) => !selected.has(column.key)).map((column) => ({
      key: column.key,
      included: false as const,
      column,
    })),
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Colunas extras</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Estas colunas vêm dos Dados Técnicos do fator de risco. A escolha guarda só a referência; o valor
          continua no cadastro do fator. Sem uma ordem salva, elas entram depois do Risco Residual. A posição
          entre as demais colunas fica em Organizar colunas. Tipo, fator, severidade e efeitos permanecem nas
          colunas nativas.
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
        <Stack spacing={1.5}>
          {rows.map((row) => {
            const catalog = INVENTORY_EXTRA_COLUMNS.find((column) => column.key === row.key)!;
            const setting = row.included ? row.column : null;
            const titleChoice: InventoryTitleChoice = setting?.headerOrientation ?? 'SAME';
            const shown = setting ? setting.visible !== false : false;
            return (
              <Stack key={row.key} spacing={0.5}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, flex: '1 1 220px' }}>
                    {catalog.headerLabel}
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={row.included}
                        onChange={(event) => include(row.key, event.target.checked)}
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
                            checked={shown}
                            onChange={(event) => patch(row.key, { visible: event.target.checked })}
                            inputProps={{ 'aria-label': `Mostrar conteúdo de ${catalog.headerLabel}` }}
                          />
                        }
                        label="Mostrar conteúdo"
                      />
                      <Stack direction="row" spacing={1}>
                        <Button size="small" disabled={draft[0]?.key === row.key} onClick={() => move(row.key, -1)}>
                          Subir
                        </Button>
                        <Button
                          size="small"
                          disabled={draft[draft.length - 1]?.key === row.key}
                          onClick={() => move(row.key, 1)}
                        >
                          Descer
                        </Button>
                      </Stack>
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
                          patch(row.key, { orientation: event.target.value as RiskInventoryColumnOrientation })
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
                          patch(row.key, {
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
                        value={inventoryExtraColumnWidthWeight(setting)}
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
                          patch(row.key, { widthWeight: next });
                        }}
                        sx={{ width: 72 }}
                      />
                      <Typography variant="caption" sx={{ minWidth: 52 }}>
                        {shown
                          ? `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(
                              inventoryWidthPercent(inventoryExtraColumnWidthWeight(setting), weightTotal),
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
                        patch(row.key, {
                          headerLabel: event.target.value.replace(/[\u0000-\u001F\u007F\u2028\u2029]/g, '').slice(0, 80),
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
