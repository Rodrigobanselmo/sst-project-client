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
  RiskInventoryColumnSetting,
  RiskInventoryColumnsPreference,
  RiskInventoryColumnsSource,
  RiskInventoryColumnKey,
} from '@v2/services/security/risk-inventory/risk-inventory.types';

import {
  inventoryColumnCanHide,
  inventoryColumnDraftHeaderChoice,
  inventoryColumnDraftHeaderLabel,
  inventoryColumnDraftOrientation,
  inventoryColumnVisible,
  inventoryColumnWidthWeight,
  inventoryWidthPercent,
  INVENTORY_WIDTH_WEIGHT_MAX,
  INVENTORY_WIDTH_WEIGHT_MIN,
  InventoryTitleChoice,
  INVENTORY_DIALOG_COLUMNS,
  INVENTORY_HIDEABLE_COLUMN_KEYS,
} from './risk-inventory.presentation';

type RiskInventoryColumnsDialogProps = {
  open: boolean;
  companyId: string;
  workspaceId: string;
  columnPreference: RiskInventoryColumnsPreference | null;
  columnPreferenceSource: RiskInventoryColumnsSource;
  onClose: () => void;
};

export function RiskInventoryColumnsDialog({
  open,
  companyId,
  workspaceId,
  columnPreference,
  columnPreferenceSource,
  onClose,
}: RiskInventoryColumnsDialogProps) {
  const mutation = useMutateRiskInventoryColumns();
  const systemMutation = useMutateSystemRiskInventoryColumns();
  const { showSnackBar } = useSystemSnackbar();
  const [systemNotice, setSystemNotice] = useState<string | null>(null);
  const [visibleDraft, setVisibleDraft] = useState(() => visibleDraftFrom(columnPreference));
  const [draft, setDraft] = useState<Record<RiskInventoryColumnKey, RiskInventoryColumnOrientation>>(
    () => draftFrom(columnPreference),
  );
  const [titleDraft, setTitleDraft] = useState<Record<RiskInventoryColumnKey, InventoryTitleChoice>>(
    () => titleDraftFrom(columnPreference),
  );
  const [labelDraft, setLabelDraft] = useState<Record<RiskInventoryColumnKey, string>>(
    () => labelDraftFrom(columnPreference),
  );
  const [weightDraft, setWeightDraft] = useState<Record<RiskInventoryColumnKey, number>>(
    () => weightDraftFrom(columnPreference),
  );

  useEffect(() => {
    if (!open) return;
    setVisibleDraft(visibleDraftFrom(columnPreference));
    setDraft(draftFrom(columnPreference));
    setTitleDraft(titleDraftFrom(columnPreference));
    setLabelDraft(labelDraftFrom(columnPreference));
    setWeightDraft(weightDraftFrom(columnPreference));
  }, [open, columnPreference, workspaceId]);

  useEffect(() => {
    if (open) setSystemNotice(null);
  }, [open, workspaceId]);

  const weightTotal = INVENTORY_DIALOG_COLUMNS.reduce((sum, column) => {
    if (inventoryColumnCanHide(column.key) && !visibleDraft[column.key]) return sum;
    return sum + weightDraft[column.key];
  }, 0);
  const busy = mutation.isPending || systemMutation.isPending;
  const currentColumns = () =>
    INVENTORY_DIALOG_COLUMNS.map((column) => {
      const setting = columnSetting(
        column.key,
        draft[column.key],
        titleDraft[column.key],
        labelDraft[column.key],
        weightDraft[column.key],
      );
      if (!inventoryColumnCanHide(column.key)) return setting;
      return { ...setting, visible: visibleDraft[column.key] };
    });
  const save = (columns: RiskInventoryColumnSetting[] | null) => {
    mutation.mutate(
      {
        companyId,
        workspaceId,
        columns,
        extraColumns: columns === null ? undefined : (columnPreference?.extraColumns ?? []),
        columnOrder: columns === null ? undefined : columnPreference?.columnOrder,
      },
      { onSuccess: () => onClose() },
    );
  };
  const defineSystemDefault = () => {
    systemMutation.mutate(
      {
        companyId,
        workspaceId,
        columns: currentColumns(),
        extraColumns: columnPreference?.extraColumns ?? [],
        columnOrder: columnPreference?.columnOrder,
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Configurar colunas</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sem personalização deste estabelecimento, a tela e o próximo PGR usam o padrão do sistema,
          quando existir; caso contrário, o padrão canônico: Tipo com título e conteúdo verticais; EPI e
          os dois RO com título horizontal e conteúdo vertical; as demais colunas horizontais. Origem fica
          oculta até ser marcada. Fonte geradora, EPI, EPC/ENG., ADM, Recomendações e a probabilidade
          residual podem ser ocultadas; as demais colunas permanecem. A largura é um peso relativo; o
          percentual ao lado fecha nas colunas que serão exibidas. Salvar aplica a escolha abaixo somente
          neste estabelecimento.
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
        <Stack spacing={1.25}>
          {INVENTORY_DIALOG_COLUMNS.map((column) => (
            <Stack key={column.key} spacing={0.5}>
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, flex: '1 1 220px' }}>
                  {column.label}
                </Typography>
                {inventoryColumnCanHide(column.key) ? (
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={visibleDraft[column.key]}
                        onChange={(event) =>
                          setVisibleDraft((current) => ({
                            ...current,
                            [column.key]: event.target.checked,
                          }))
                        }
                        inputProps={{ 'aria-label': `Mostrar conteúdo de ${column.label}` }}
                      />
                    }
                    label="Mostrar conteúdo"
                  />
                ) : null}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
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
                  <Typography variant="caption" color="text.secondary">
                    Largura
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={weightDraft[column.key]}
                    inputProps={{
                      min: INVENTORY_WIDTH_WEIGHT_MIN,
                      max: INVENTORY_WIDTH_WEIGHT_MAX,
                      step: 1,
                      'aria-label': `Largura de ${column.label}`,
                    }}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (!Number.isInteger(next)) return;
                      if (next < INVENTORY_WIDTH_WEIGHT_MIN || next > INVENTORY_WIDTH_WEIGHT_MAX) return;
                      setWeightDraft((current) => ({ ...current, [column.key]: next }));
                    }}
                    sx={{ width: 72 }}
                  />
                  <Typography variant="caption" sx={{ minWidth: 52 }}>
                    {inventoryColumnCanHide(column.key) && !visibleDraft[column.key]
                      ? 'oculta'
                      : weightPercent(weightDraft[column.key], weightTotal)}
                  </Typography>
                </Stack>
              </Stack>
              <TextField
                size="small"
                fullWidth
                placeholder="Título personalizado"
                value={labelDraft[column.key]}
                inputProps={{ maxLength: 80, 'aria-label': 'Título personalizado' }}
                onChange={(event) =>
                  setLabelDraft((current) => ({
                    ...current,
                    [column.key]: event.target.value.replace(/[\u0000-\u001F\u007F\u2028\u2029]/g, '').slice(0, 80),
                  }))
                }
              />
            </Stack>
          ))}
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
          <Button variant="contained" disabled={busy} onClick={() => save(currentColumns())}>
            Salvar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

function visibleDraftFrom(preference: RiskInventoryColumnsPreference | null) {
  return Object.fromEntries(
    INVENTORY_HIDEABLE_COLUMN_KEYS.map((key) => [key, inventoryColumnVisible(preference, key)]),
  ) as Record<(typeof INVENTORY_HIDEABLE_COLUMN_KEYS)[number], boolean>;
}

function draftFrom(preference: RiskInventoryColumnsPreference | null) {
  return Object.fromEntries(
    INVENTORY_DIALOG_COLUMNS.map((column) => [
      column.key,
      inventoryColumnDraftOrientation(preference, column.key),
    ]),
  ) as Record<RiskInventoryColumnKey, RiskInventoryColumnOrientation>;
}

function columnSetting(
  key: RiskInventoryColumnKey,
  orientation: RiskInventoryColumnOrientation,
  title: InventoryTitleChoice,
  headerLabel: string,
  widthWeight: number,
): RiskInventoryColumnSetting {
  const label = headerLabel.trim();
  const width = { widthWeight };
  if (title === 'SAME') return label ? { key, orientation, headerLabel: label, ...width } : { key, orientation, ...width };
  return label
    ? { key, orientation, headerOrientation: title, headerLabel: label, ...width }
    : { key, orientation, headerOrientation: title, ...width };
}

function weightDraftFrom(preference: RiskInventoryColumnsPreference | null) {
  return Object.fromEntries(
    INVENTORY_DIALOG_COLUMNS.map((column) => [column.key, inventoryColumnWidthWeight(preference, column.key)]),
  ) as Record<RiskInventoryColumnKey, number>;
}

function weightPercent(weight: number, total: number) {
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(
    inventoryWidthPercent(weight, total),
  )}%`;
}

function labelDraftFrom(preference: RiskInventoryColumnsPreference | null) {
  return Object.fromEntries(
    INVENTORY_DIALOG_COLUMNS.map((column) => [
      column.key,
      inventoryColumnDraftHeaderLabel(preference, column.key),
    ]),
  ) as Record<RiskInventoryColumnKey, string>;
}

function titleDraftFrom(preference: RiskInventoryColumnsPreference | null) {
  return Object.fromEntries(
    INVENTORY_DIALOG_COLUMNS.map((column) => [
      column.key,
      inventoryColumnDraftHeaderChoice(preference, column.key),
    ]),
  ) as Record<RiskInventoryColumnKey, InventoryTitleChoice>;
}
