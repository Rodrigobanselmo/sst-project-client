import { FC, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import { IBulkExamRiskPatch } from 'core/services/hooks/mutations/checklist/exams/useMutBulkUpdateExamRisk/useMutBulkUpdateExamRisk';

type SexOption = 'male' | 'female' | 'both';

type Props = {
  open: boolean;
  count: number;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: (patch: IBulkExamRiskPatch) => void;
};

const degreeOptions = Object.values(matrixRiskMap).filter(
  (m) => m.level > 0 && m.level < 6,
);

const parseAge = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export const BulkEditExamRiskModal: FC<Props> = ({
  open,
  count,
  isSaving,
  onClose,
  onConfirm,
}) => {
  const [enablePeriodicity, setEnablePeriodicity] = useState(false);
  const [periodicity, setPeriodicity] = useState({
    isAdmission: true,
    isPeriodic: true,
    isChange: true,
    isReturn: false,
    isDismissal: true,
  });

  const [enableSex, setEnableSex] = useState(false);
  const [sex, setSex] = useState<SexOption>('both');

  const [enableAge, setEnableAge] = useState(false);
  const [fromAge, setFromAge] = useState('');
  const [toAge, setToAge] = useState('');

  const [enableValidity, setEnableValidity] = useState(false);
  const [validity, setValidity] = useState('');

  const [enableConsiderDays, setEnableConsiderDays] = useState(false);
  const [considerDays, setConsiderDays] = useState('');

  const [enableQualitative, setEnableQualitative] = useState(false);
  const [qualitative, setQualitative] = useState('3');

  const [enableQuantitative, setEnableQuantitative] = useState(false);
  const [quantitative, setQuantitative] = useState('3');

  useEffect(() => {
    if (!open) {
      setEnablePeriodicity(false);
      setEnableSex(false);
      setEnableAge(false);
      setEnableValidity(false);
      setEnableConsiderDays(false);
      setEnableQualitative(false);
      setEnableQuantitative(false);
      setFromAge('');
      setToAge('');
      setValidity('');
      setConsiderDays('');
      setSex('both');
      setQualitative('3');
      setQuantitative('3');
      setPeriodicity({
        isAdmission: true,
        isPeriodic: true,
        isChange: true,
        isReturn: false,
        isDismissal: true,
      });
    }
  }, [open]);

  const patch = useMemo<IBulkExamRiskPatch>(() => {
    const result: IBulkExamRiskPatch = {};

    if (enablePeriodicity) {
      result.isAdmission = periodicity.isAdmission;
      result.isPeriodic = periodicity.isPeriodic;
      result.isChange = periodicity.isChange;
      result.isReturn = periodicity.isReturn;
      result.isDismissal = periodicity.isDismissal;
    }

    if (enableSex) {
      result.isMale = sex === 'male' || sex === 'both';
      result.isFemale = sex === 'female' || sex === 'both';
    }

    if (enableAge) {
      result.fromAge = parseAge(fromAge);
      result.toAge = parseAge(toAge);
    }

    if (enableValidity) {
      result.validityInMonths = parseAge(validity);
    }

    if (enableConsiderDays) {
      result.considerBetweenDays = parseAge(considerDays);
    }

    if (enableQualitative) {
      result.minRiskDegree = parseInt(qualitative, 10);
    }

    if (enableQuantitative) {
      result.minRiskDegreeQuantity = parseInt(quantitative, 10);
    }

    return result;
  }, [
    enablePeriodicity,
    periodicity,
    enableSex,
    sex,
    enableAge,
    fromAge,
    toAge,
    enableValidity,
    validity,
    enableConsiderDays,
    considerDays,
    enableQualitative,
    qualitative,
    enableQuantitative,
    quantitative,
  ]);

  const changedSummary = useMemo(() => {
    const labels: string[] = [];
    if (enablePeriodicity) labels.push('Periodicidade');
    if (enableSex) labels.push('Sexo');
    if (enableAge) labels.push('Faixa etária');
    if (enableValidity) labels.push('Periodicidade (meses)');
    if (enableConsiderDays) labels.push('Considerar (dias entre ocupacional)');
    if (enableQualitative) labels.push('Qualitativo mínimo');
    if (enableQuantitative) labels.push('Quantitativo mínimo');
    return labels;
  }, [
    enablePeriodicity,
    enableSex,
    enableAge,
    enableValidity,
    enableConsiderDays,
    enableQualitative,
    enableQuantitative,
  ]);

  const hasChanges = changedSummary.length > 0;

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Editar vínculos selecionados</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="body2" color="text.secondary">
            {count} vínculo(s) selecionado(s). Marque apenas os campos que deseja
            alterar. Campos não marcados permanecem inalterados.
          </Typography>

          {/* Periodicidade (tipos) */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enablePeriodicity}
                  onChange={(e) => setEnablePeriodicity(e.target.checked)}
                />
              }
              label="Periodicidade (tipos de exame)"
            />
            {enablePeriodicity && (
              <Box display="flex" flexWrap="wrap" gap={1} pl={4}>
                {(
                  [
                    ['isAdmission', 'Admissional'],
                    ['isPeriodic', 'Periódico'],
                    ['isChange', 'Mudança'],
                    ['isReturn', 'Retorno'],
                    ['isDismissal', 'Demissional'],
                  ] as [keyof typeof periodicity, string][]
                ).map(([key, label]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Checkbox
                        size="small"
                        checked={periodicity[key]}
                        onChange={(e) =>
                          setPeriodicity((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                      />
                    }
                    label={label}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Divider />

          {/* Sexo */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableSex}
                  onChange={(e) => setEnableSex(e.target.checked)}
                />
              }
              label="Sexo"
            />
            {enableSex && (
              <Box pl={4} maxWidth={220}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={sex}
                  onChange={(e) => setSex(e.target.value as SexOption)}
                >
                  <MenuItem value="both">Ambos</MenuItem>
                  <MenuItem value="male">Masculino</MenuItem>
                  <MenuItem value="female">Feminino</MenuItem>
                </TextField>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Faixa etária */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableAge}
                  onChange={(e) => setEnableAge(e.target.checked)}
                />
              }
              label="Faixa etária"
            />
            {enableAge && (
              <Box display="flex" gap={2} pl={4} alignItems="center">
                <TextField
                  size="small"
                  label="De (anos)"
                  value={fromAge}
                  onChange={(e) =>
                    setFromAge(e.target.value.replace(/\D/g, ''))
                  }
                  sx={{ maxWidth: 120 }}
                />
                <TextField
                  size="small"
                  label="Até (anos)"
                  value={toAge}
                  onChange={(e) => setToAge(e.target.value.replace(/\D/g, ''))}
                  sx={{ maxWidth: 120 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Deixe vazio para limpar a faixa etária.
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Periodicidade (meses) */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableValidity}
                  onChange={(e) => setEnableValidity(e.target.checked)}
                />
              }
              label="Periodicidade (meses)"
            />
            {enableValidity && (
              <Box display="flex" gap={2} pl={4} alignItems="center">
                <TextField
                  size="small"
                  label="Meses"
                  value={validity}
                  onChange={(e) =>
                    setValidity(e.target.value.replace(/\D/g, ''))
                  }
                  sx={{ maxWidth: 120 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Deixe vazio para limpar a periodicidade.
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Considerar (dias entre ocupacional) */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableConsiderDays}
                  onChange={(e) => setEnableConsiderDays(e.target.checked)}
                />
              }
              label="Considerar (dias entre ocupacional)"
            />
            {enableConsiderDays && (
              <Box display="flex" gap={2} pl={4} alignItems="center">
                <TextField
                  size="small"
                  label="Dias"
                  value={considerDays}
                  onChange={(e) =>
                    setConsiderDays(e.target.value.replace(/\D/g, ''))
                  }
                  sx={{ maxWidth: 120 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Deixe vazio para limpar o valor.
                </Typography>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Qualitativo */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableQualitative}
                  onChange={(e) => setEnableQualitative(e.target.checked)}
                />
              }
              label="Grau de risco mínimo — Qualitativo"
            />
            {enableQualitative && (
              <Box pl={4} maxWidth={220}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={qualitative}
                  onChange={(e) => setQualitative(e.target.value)}
                >
                  {degreeOptions.map((option) => (
                    <MenuItem key={option.level} value={String(option.level)}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            )}
          </Box>

          <Divider />

          {/* Quantitativo */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableQuantitative}
                  onChange={(e) => setEnableQuantitative(e.target.checked)}
                />
              }
              label="Grau de risco mínimo — Quantitativo"
            />
            {enableQuantitative && (
              <Box pl={4} maxWidth={220}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={quantitative}
                  onChange={(e) => setQuantitative(e.target.value)}
                >
                  {degreeOptions.map((option) => (
                    <MenuItem key={option.level} value={String(option.level)}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            )}
          </Box>

          {hasChanges ? (
            <Alert severity="info">
              Serão alterados em <strong>{count}</strong> vínculo(s):{' '}
              {changedSummary.join(', ')}.
            </Alert>
          ) : (
            <Alert severity="warning">
              Marque ao menos um campo para aplicar a edição em lote.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => onConfirm(patch)}
          disabled={!hasChanges || isSaving}
        >
          {isSaving ? 'Aplicando...' : 'Aplicar alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
