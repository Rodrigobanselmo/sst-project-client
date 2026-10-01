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
  TextField,
  Typography,
} from '@mui/material';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoleEnum } from 'project/enum/roles.enums';

import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';
import { useMutateRiskTechnicalDataColumns } from '@v2/services/security/risk-technical-data/useMutateRiskTechnicalDataColumns';
import { useMutateSystemRiskTechnicalDataColumns } from '@v2/services/security/risk-technical-data/useMutateSystemRiskTechnicalDataColumns';
import {
  RiskTechnicalColumnKey,
  RiskTechnicalColumnOrientation,
  RiskTechnicalColumnSetting,
  RiskTechnicalColumnsPreference,
  RiskTechnicalColumnsSource,
  RiskTechnicalDataGroup,
} from '@v2/services/security/risk-technical-data/risk-technical-data.types';

import {
  RISK_TECHNICAL_WIDTH_WEIGHT_MAX,
  RISK_TECHNICAL_WIDTH_WEIGHT_MIN,
  RiskTechnicalTitleChoice,
  riskTechnicalColumnContentOrientation,
  riskTechnicalColumnWeight,
  riskTechnicalColumns,
  riskTechnicalTitleChoice,
  riskTechnicalWidthPercent,
} from './risk-technical-data.presentation';

type RiskTechnicalDataColumnsDialogProps = {
  open: boolean;
  companyId: string;
  workspaceId: string;
  family: RiskTechnicalDataGroup;
  columnPreference: RiskTechnicalColumnsPreference | null;
  columnPreferenceSource: RiskTechnicalColumnsSource;
  onClose: () => void;
};

export function RiskTechnicalDataColumnsDialog({
  open,
  companyId,
  workspaceId,
  family,
  columnPreference,
  columnPreferenceSource,
  onClose,
}: RiskTechnicalDataColumnsDialogProps) {
  const columns = riskTechnicalColumns(family);
  const mutation = useMutateRiskTechnicalDataColumns();
  const systemMutation = useMutateSystemRiskTechnicalDataColumns();
  const { showSnackBar } = useSystemSnackbar();
  const [systemNotice, setSystemNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState(() => orientationDraft(columns, columnPreference));
  const [titleDraft, setTitleDraft] = useState(() => titleDraftFrom(columns, columnPreference));
  const [weightDraft, setWeightDraft] = useState(() => weightDraftFrom(columns, columnPreference));

  useEffect(() => {
    if (!open) return;
    setDraft(orientationDraft(columns, columnPreference));
    setTitleDraft(titleDraftFrom(columns, columnPreference));
    setWeightDraft(weightDraftFrom(columns, columnPreference));
  }, [open, columnPreference, family, workspaceId, columns]);

  useEffect(() => {
    if (open) setSystemNotice(null);
  }, [open, family, workspaceId]);

  const weightTotal = columns.reduce((sum, column) => sum + weightDraft[column.key], 0);
  const busy = mutation.isPending || systemMutation.isPending;
  const currentColumns = (): RiskTechnicalColumnSetting[] =>
    columns.map((column) => {
      const title = titleDraft[column.key];
      return {
        key: column.key,
        orientation: draft[column.key],
        ...(title === 'SAME' ? {} : { headerOrientation: title }),
        widthWeight: weightDraft[column.key],
      };
    });
  const save = (next: RiskTechnicalColumnSetting[] | null) => {
    mutation.mutate(
      { companyId, workspaceId, family, columns: next },
      { onSuccess: () => onClose() },
    );
  };
  const defineSystemDefault = () => {
    systemMutation.mutate(
      { companyId, workspaceId, family, columns: currentColumns() },
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
          {family === 'PHYSICAL_CHEMICAL' ? 'Físicos e Químicos' : 'Demais Fatores'}. Sem personalização
          deste estabelecimento, a tela usa o padrão do sistema, quando existir; caso contrário, o padrão
          canônico. A largura é um peso relativo e o percentual fecha em 100% das colunas desta família.
          Salvar aplica a escolha somente neste estabelecimento e somente nesta família.
        </Typography>
        {columnPreferenceSource === 'workspace' ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Este estabelecimento tem personalização própria nesta família. Salvar altera só ela.
          </Alert>
        ) : null}
        {columnPreferenceSource === 'global' ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            Esta família está usando o padrão do sistema. Salvar passa a guardá-la como personalização própria.
          </Alert>
        ) : null}
        {systemNotice ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {systemNotice}
          </Alert>
        ) : null}
        <Stack spacing={1.25}>
          {columns.map((column) => (
            <Stack
              key={column.key}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, flex: '1 1 220px' }}>
                {column.headerLabel}
              </Typography>
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
                      [column.key]: event.target.value as RiskTechnicalColumnOrientation,
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
                      [column.key]: event.target.value as RiskTechnicalTitleChoice,
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
                    min: RISK_TECHNICAL_WIDTH_WEIGHT_MIN,
                    max: RISK_TECHNICAL_WIDTH_WEIGHT_MAX,
                    step: 1,
                    'aria-label': `Largura de ${column.headerLabel}`,
                  }}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (!Number.isInteger(next)) return;
                    if (next < RISK_TECHNICAL_WIDTH_WEIGHT_MIN || next > RISK_TECHNICAL_WIDTH_WEIGHT_MAX) return;
                    setWeightDraft((current) => ({ ...current, [column.key]: next }));
                  }}
                  sx={{ width: 72 }}
                />
                <Typography variant="caption" sx={{ minWidth: 52 }}>
                  {weightPercent(weightDraft[column.key], weightTotal)}
                </Typography>
              </Stack>
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

function orientationDraft(
  columns: ReturnType<typeof riskTechnicalColumns>,
  preference: RiskTechnicalColumnsPreference | null,
) {
  return Object.fromEntries(
    columns.map((column) => [column.key, riskTechnicalColumnContentOrientation(columns, preference, column.key)]),
  ) as Record<RiskTechnicalColumnKey, RiskTechnicalColumnOrientation>;
}

function titleDraftFrom(
  columns: ReturnType<typeof riskTechnicalColumns>,
  preference: RiskTechnicalColumnsPreference | null,
) {
  return Object.fromEntries(
    columns.map((column) => [column.key, riskTechnicalTitleChoice(columns, preference, column.key)]),
  ) as Record<RiskTechnicalColumnKey, RiskTechnicalTitleChoice>;
}

function weightDraftFrom(
  columns: ReturnType<typeof riskTechnicalColumns>,
  preference: RiskTechnicalColumnsPreference | null,
) {
  return Object.fromEntries(
    columns.map((column) => [column.key, riskTechnicalColumnWeight(columns, preference, column.key)]),
  ) as Record<RiskTechnicalColumnKey, number>;
}

function weightPercent(weight: number, total: number) {
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(
    riskTechnicalWidthPercent(weight, total),
  )}%`;
}
