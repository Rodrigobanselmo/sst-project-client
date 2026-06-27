import { FC, useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import {
  useMutateCreateAcgihBeiIndicator,
  useMutateUpdateAcgihBeiIndicator,
} from '@v2/services/medicine/acgih-bei-indicator/hooks/useMutateAcgihBeiIndicator';
import {
  AcgihBeiIndicatorConfidenceEnum,
  AcgihBeiIndicatorSourceEnum,
  AcgihBeiIndicatorStatusEnum,
  IAcgihBeiIndicator,
} from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.types';

import {
  acgihBeiConfidenceLabels,
  acgihBeiSourceLabels,
  acgihBeiStatusLabels,
} from '../acgih-bei-indicator-labels';

type Props = {
  open: boolean;
  item: IAcgihBeiIndicator | null;
  onClose: () => void;
};

const NO_CONFIDENCE = '';

type FormState = {
  substanceName: string;
  cas: string;
  referenceYear: string;
  determinant: string;
  biologicalMatrix: string;
  samplingTime: string;
  beiValue: string;
  unit: string;
  notation: string;
  status: AcgihBeiIndicatorStatusEnum;
  source: AcgihBeiIndicatorSourceEnum;
  sourceYear: string;
  confidence: AcgihBeiIndicatorConfidenceEnum | typeof NO_CONFIDENCE;
  isCurated: boolean;
  internalNotes: string;
  sourcePage: string;
};

const emptyState: FormState = {
  substanceName: '',
  cas: '',
  referenceYear: '',
  determinant: '',
  biologicalMatrix: '',
  samplingTime: '',
  beiValue: '',
  unit: '',
  notation: '',
  status: AcgihBeiIndicatorStatusEnum.DRAFT,
  source: AcgihBeiIndicatorSourceEnum.ACGIH_BEI,
  sourceYear: '',
  confidence: NO_CONFIDENCE,
  isCurated: false,
  internalNotes: '',
  sourcePage: '',
};

const parseYear = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isInteger(num) ? num : null;
};

export const AcgihBeiIndicatorFormModal: FC<Props> = ({
  open,
  item,
  onClose,
}) => {
  const createMutation = useMutateCreateAcgihBeiIndicator();
  const updateMutation = useMutateUpdateAcgihBeiIndicator();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [form, setForm] = useState<FormState>(emptyState);

  useEffect(() => {
    if (!open) return;
    if (!item) {
      setForm(emptyState);
      return;
    }
    setForm({
      substanceName: item.substanceName,
      cas: item.cas ?? '',
      referenceYear: item.referenceYear?.toString() ?? '',
      determinant: item.determinant ?? '',
      biologicalMatrix: item.biologicalMatrix ?? '',
      samplingTime: item.samplingTime ?? '',
      beiValue: item.beiValue ?? '',
      unit: item.unit ?? '',
      notation: item.notation ?? '',
      status: item.status,
      source: item.source,
      sourceYear: item.sourceYear?.toString() ?? '',
      confidence: item.confidence ?? NO_CONFIDENCE,
      isCurated: item.isCurated,
      internalNotes: item.internalNotes ?? '',
      sourcePage: item.sourcePage ?? '',
    });
  }, [open, item]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.substanceName.trim()) return;

    const payload = {
      substanceName: form.substanceName.trim(),
      cas: form.cas.trim() || null,
      referenceYear: parseYear(form.referenceYear),
      determinant: form.determinant.trim() || null,
      biologicalMatrix: form.biologicalMatrix.trim() || null,
      samplingTime: form.samplingTime.trim() || null,
      beiValue: form.beiValue.trim() || null,
      unit: form.unit.trim() || null,
      notation: form.notation.trim() || null,
      status: form.status,
      source: form.source,
      sourceYear: parseYear(form.sourceYear),
      confidence:
        form.confidence === NO_CONFIDENCE ? null : form.confidence,
      isCurated: form.isCurated,
      internalNotes: form.internalNotes.trim() || null,
      sourcePage: form.sourcePage.trim() || null,
    };

    if (item) {
      updateMutation.mutate(
        { id: item.id, payload },
        { onSuccess: () => onClose() },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: () => onClose() });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {item ? 'Editar indicador ACGIH/BEI' : 'Novo indicador ACGIH/BEI'}
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <Alert severity="info">
            Base técnica de referência interna. Não é aplicada automaticamente em
            empresas, exames, vínculos ou na Biblioteca Risco × Exame.
          </Alert>

          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              label="Substância *"
              value={form.substanceName}
              onChange={(e) => setField('substanceName', e.target.value)}
              size="small"
              sx={{ flex: '2 1 280px' }}
              required
            />
            <TextField
              label="CAS"
              value={form.cas}
              onChange={(e) => setField('cas', e.target.value)}
              size="small"
              sx={{ flex: '1 1 140px' }}
            />
            <TextField
              label="Ano de referência"
              value={form.referenceYear}
              onChange={(e) => setField('referenceYear', e.target.value)}
              size="small"
              sx={{ flex: '1 1 120px' }}
            />
          </Box>

          <TextField
            label="Determinante"
            value={form.determinant}
            onChange={(e) => setField('determinant', e.target.value)}
            size="small"
          />

          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              label="Matriz biológica"
              value={form.biologicalMatrix}
              onChange={(e) => setField('biologicalMatrix', e.target.value)}
              size="small"
              sx={{ flex: '1 1 200px' }}
            />
            <TextField
              label="Momento de amostragem"
              value={form.samplingTime}
              onChange={(e) => setField('samplingTime', e.target.value)}
              size="small"
              sx={{ flex: '1 1 200px' }}
            />
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              label="Valor BEI"
              value={form.beiValue}
              onChange={(e) => setField('beiValue', e.target.value)}
              size="small"
              sx={{ flex: '1 1 160px' }}
              helperText="Texto livre (símbolos, faixas, % etc.)"
            />
            <TextField
              label="Unidade"
              value={form.unit}
              onChange={(e) => setField('unit', e.target.value)}
              size="small"
              sx={{ flex: '1 1 160px' }}
            />
            <TextField
              label="Notação"
              value={form.notation}
              onChange={(e) => setField('notation', e.target.value)}
              size="small"
              sx={{ flex: '1 1 140px' }}
            />
          </Box>

          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(e) =>
                setField('status', e.target.value as AcgihBeiIndicatorStatusEnum)
              }
              size="small"
              sx={{ flex: '1 1 150px' }}
            >
              {Object.values(AcgihBeiIndicatorStatusEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {acgihBeiStatusLabels[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Fonte"
              value={form.source}
              onChange={(e) =>
                setField('source', e.target.value as AcgihBeiIndicatorSourceEnum)
              }
              size="small"
              sx={{ flex: '1 1 150px' }}
            >
              {Object.values(AcgihBeiIndicatorSourceEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {acgihBeiSourceLabels[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Confiança"
              value={form.confidence}
              onChange={(e) =>
                setField(
                  'confidence',
                  e.target.value as
                    | AcgihBeiIndicatorConfidenceEnum
                    | typeof NO_CONFIDENCE,
                )
              }
              size="small"
              sx={{ flex: '1 1 150px' }}
            >
              <MenuItem value={NO_CONFIDENCE}>Não informada</MenuItem>
              {Object.values(AcgihBeiIndicatorConfidenceEnum).map((value) => (
                <MenuItem key={value} value={value}>
                  {acgihBeiConfidenceLabels[value]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Ano da fonte"
              value={form.sourceYear}
              onChange={(e) => setField('sourceYear', e.target.value)}
              size="small"
              sx={{ flex: '1 1 120px' }}
            />
            <TextField
              label="Página da fonte"
              value={form.sourcePage}
              onChange={(e) => setField('sourcePage', e.target.value)}
              size="small"
              sx={{ flex: '1 1 120px' }}
            />
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={form.isCurated}
                onChange={(e) => setField('isCurated', e.target.checked)}
              />
            }
            label="Curado / revisado"
          />

          <TextField
            label="Observações técnicas (internas)"
            value={form.internalNotes}
            onChange={(e) => setField('internalNotes', e.target.value)}
            size="small"
            multiline
            minRows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isPending || !form.substanceName.trim()}
        >
          {isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
