import { FC, useEffect, useState } from 'react';

import {
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
import { IPcmsoExamDefaults } from 'core/interfaces/api/IPcmsoExamDefaults';

type SexOption = 'male' | 'female' | 'both';

type Props = {
  open: boolean;
  isSaving: boolean;
  initialValue: IPcmsoExamDefaults;
  onClose: () => void;
  onConfirm: (defaults: IPcmsoExamDefaults) => void;
};

const degreeOptions = Object.values(matrixRiskMap).filter(
  (m) => m.level > 0 && m.level < 6,
);

const numToStr = (value?: number | null) =>
  typeof value === 'number' ? String(value) : '';

const parseNum = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const sexFromDefaults = (value: IPcmsoExamDefaults): SexOption => {
  const male = value.isMale ?? true;
  const female = value.isFemale ?? true;
  if (male && !female) return 'male';
  if (female && !male) return 'female';
  return 'both';
};

export const PcmsoExamDefaultsModal: FC<Props> = ({
  open,
  isSaving,
  initialValue,
  onClose,
  onConfirm,
}) => {
  const [periodicity, setPeriodicity] = useState({
    isAdmission: true,
    isPeriodic: true,
    isChange: true,
    isReturn: false,
    isDismissal: true,
  });
  const [sex, setSex] = useState<SexOption>('both');
  const [fromAge, setFromAge] = useState('');
  const [toAge, setToAge] = useState('');
  const [validity, setValidity] = useState('');
  const [considerDays, setConsiderDays] = useState('');
  const [qualitative, setQualitative] = useState('');
  const [quantitative, setQuantitative] = useState('');

  useEffect(() => {
    if (!open) return;

    setPeriodicity({
      isAdmission: initialValue.isAdmission ?? true,
      isPeriodic: initialValue.isPeriodic ?? true,
      isChange: initialValue.isChange ?? true,
      isReturn: initialValue.isReturn ?? false,
      isDismissal: initialValue.isDismissal ?? true,
    });
    setSex(sexFromDefaults(initialValue));
    setFromAge(numToStr(initialValue.fromAge));
    setToAge(numToStr(initialValue.toAge));
    setValidity(numToStr(initialValue.validityInMonths));
    setConsiderDays(numToStr(initialValue.considerBetweenDays));
    setQualitative(numToStr(initialValue.minRiskDegree));
    setQuantitative(numToStr(initialValue.minRiskDegreeQuantity));
  }, [open, initialValue]);

  const handleConfirm = () => {
    const defaults: IPcmsoExamDefaults = {
      isAdmission: periodicity.isAdmission,
      isPeriodic: periodicity.isPeriodic,
      isChange: periodicity.isChange,
      isReturn: periodicity.isReturn,
      isDismissal: periodicity.isDismissal,
      isMale: sex === 'male' || sex === 'both',
      isFemale: sex === 'female' || sex === 'both',
      fromAge: parseNum(fromAge),
      toAge: parseNum(toAge),
      validityInMonths: parseNum(validity),
      considerBetweenDays: parseNum(considerDays),
      minRiskDegree: parseNum(qualitative),
      minRiskDegreeQuantity: parseNum(quantitative),
    };

    onConfirm(defaults);
  };

  return (
    <Dialog
      open={open}
      onClose={isSaving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Padrões de PCMSO da empresa</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="body2" color="text.secondary">
            Estes padrões pré-preenchem o formulário ao adicionar um novo
            vínculo Exame × Risco. Eles não alteram vínculos já existentes e
            podem ser sobrescritos em cada vínculo.
          </Typography>

          {/* Periodicidade (tipos) */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Periodicidade (tipos de exame)
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
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
          </Box>

          <Divider />

          {/* Sexo */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Sexo
            </Typography>
            <Box maxWidth={220}>
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
          </Box>

          <Divider />

          {/* Faixa etária */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Faixa etária
            </Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                size="small"
                label="De (anos)"
                value={fromAge}
                onChange={(e) => setFromAge(e.target.value.replace(/\D/g, ''))}
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
                Vazio = sem faixa etária padrão.
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Periodicidade (meses) + Considerar (dias) */}
          <Box display="flex" gap={2} flexWrap="wrap">
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Periodicidade (meses)
              </Typography>
              <TextField
                size="small"
                label="Meses"
                value={validity}
                onChange={(e) => setValidity(e.target.value.replace(/\D/g, ''))}
                sx={{ maxWidth: 140 }}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Considerar (dias entre ocupacional)
              </Typography>
              <TextField
                size="small"
                label="Dias"
                value={considerDays}
                onChange={(e) =>
                  setConsiderDays(e.target.value.replace(/\D/g, ''))
                }
                sx={{ maxWidth: 140 }}
              />
            </Box>
          </Box>

          <Divider />

          {/* Grau de risco mínimo */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Grau de risco mínimo
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Box maxWidth={200} flex={1}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Qualitativo"
                  value={qualitative}
                  onChange={(e) => setQualitative(e.target.value)}
                >
                  <MenuItem value="">Sem padrão</MenuItem>
                  {degreeOptions.map((option) => (
                    <MenuItem key={option.level} value={String(option.level)}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box maxWidth={200} flex={1}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Quantitativo"
                  value={quantitative}
                  onChange={(e) => setQuantitative(e.target.value)}
                >
                  <MenuItem value="">Sem padrão</MenuItem>
                  {degreeOptions.map((option) => (
                    <MenuItem key={option.level} value={String(option.level)}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button variant="outlined" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar padrões'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
