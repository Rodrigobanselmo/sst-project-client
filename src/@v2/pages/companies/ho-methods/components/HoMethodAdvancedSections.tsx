import { FC, useMemo } from 'react';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { SAutocompleteSelect } from '@v2/components/forms/fields/SAutocompleteSelect/SAutocompleteSelect';
import {
  HoExtractionSolventRecord,
  HoLaboratoryRecord,
  HoMethodEvaluationConditionPayload,
  HoMethodLaboratoryAvailabilityStatusEnum,
  HoMethodLaboratoryPayload,
  HoSamplerRecord,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

import {
  HO_METHOD_LAB_STATUS_OPTIONS,
  HO_METHOD_TEMPERATURE_UNIT_OPTIONS,
  normalizeHoMethodTemperatureUnit,
} from '../maps/ho-method.maps';
import { InferredEvaluationOption } from '../utils/ho-method-evaluation.util';
import {
  buildLabNumericInputKey,
  labNumericInputsFromLaboratories,
  type LabNumericFieldKey,
  type LabNumericInputs,
} from '../utils/ho-method-form-validation.util';

type Props = {
  evaluationDisplayOptions: InferredEvaluationOption[];
  selectedConditions: HoMethodEvaluationConditionPayload[];
  onChangeConditions: (conditions: HoMethodEvaluationConditionPayload[]) => void;
  activeAgentLabel?: string;
  conditionError?: string;
  laboratories: HoMethodLaboratoryPayload[];
  onChangeLaboratories: (labs: HoMethodLaboratoryPayload[]) => void;
  labNumericInputs: LabNumericInputs;
  onChangeLabNumericInputs: (inputs: LabNumericInputs) => void;
  methodDefaults: {
    minimumFlowRate?: number | null;
    maximumFlowRate?: number | null;
    minimumVolume?: number | null;
    maximumVolume?: number | null;
    storageTemperature?: number | null;
    storageTemperatureUnit?: string | null;
    stabilityDays?: number | null;
    samplerId?: string | null;
    extractionSolventId?: string | null;
  };
  onQuickCreateSampler: () => void | Promise<void>;
  onQuickCreateSolvent: () => void | Promise<void>;
  onQuickCreateLaboratory: () => void | Promise<void>;
  onLaboratorySearch: (value: string) => void;
  samplerOptions: HoSamplerRecord[];
  solventOptions: HoExtractionSolventRecord[];
  laboratoryOptions: HoLaboratoryRecord[];
  loadingSamplers: boolean;
  loadingSolvents: boolean;
  loadingLaboratories: boolean;
  fieldErrors: Record<string, string>;
};

const emptyLab = (): HoMethodLaboratoryPayload => ({
  laboratoryId: null,
  laboratoryName: '',
  availabilityStatus: HoMethodLaboratoryAvailabilityStatusEnum.UNKNOWN,
});

const getLaboratoryLabel = (lab: HoLaboratoryRecord) => {
  const name = lab.tradeName?.trim() || lab.corporateName.trim();
  return lab.cnpj ? `${name} · ${cnpjMask.mask(lab.cnpj)}` : name;
};

const getLaboratoryDisplayName = (lab: HoLaboratoryRecord) =>
  lab.tradeName?.trim() || lab.corporateName.trim();

const FLOW_VOLUME_OVERRIDE_FIELDS: Array<{
  key: LabNumericFieldKey;
  label: string;
  inputMode: 'decimal' | 'numeric';
}> = [
  { key: 'minimumFlowRateOverride', label: 'Vazão mín. override', inputMode: 'decimal' },
  { key: 'maximumFlowRateOverride', label: 'Vazão máx. override', inputMode: 'decimal' },
  { key: 'minimumVolumeOverride', label: 'Volume mín. override', inputMode: 'decimal' },
  { key: 'maximumVolumeOverride', label: 'Volume máx. override', inputMode: 'decimal' },
];

const TEMPERATURE_OVERRIDE_FIELD = {
  key: 'storageTemperatureOverride' as LabNumericFieldKey,
  label: 'Temperatura override',
  inputMode: 'decimal' as const,
};

const STABILITY_OVERRIDE_FIELD = {
  key: 'stabilityDaysOverride' as LabNumericFieldKey,
  label: 'Estabilidade override (dias)',
  inputMode: 'numeric' as const,
};

const formatDefaultPlaceholder = (value?: number | null) =>
  value == null ? '' : String(value).replace('.', ',');

const formatLimitLine = (option: InferredEvaluationOption) => {
  const unitSuffix = option.limitUnit ? ` ${option.limitUnit}` : '';
  if (option.helperText) return option.helperText;
  if (option.limitValue) return `Limite: ${option.limitValue}${unitSuffix}`;
  return 'Limite não informado no fator de risco';
};

export const HoMethodAdvancedSections: FC<Props> = ({
  evaluationDisplayOptions,
  selectedConditions,
  onChangeConditions,
  activeAgentLabel,
  conditionError,
  laboratories,
  onChangeLaboratories,
  labNumericInputs,
  onChangeLabNumericInputs,
  methodDefaults,
  onQuickCreateSampler,
  onQuickCreateSolvent,
  onQuickCreateLaboratory,
  onLaboratorySearch,
  samplerOptions,
  solventOptions,
  laboratoryOptions,
  loadingSamplers,
  loadingSolvents,
  loadingLaboratories,
  fieldErrors,
}) => {
  const toggleCondition = (
    option: InferredEvaluationOption,
    checked: boolean,
  ) => {
    if (checked) {
      onChangeConditions([
        ...selectedConditions.filter(
          (item) => item.evaluationType !== option.evaluationType,
        ),
        {
          evaluationType: option.evaluationType,
          limitValue: option.limitValue,
          limitUnit: option.limitUnit,
          flowRateUnit: 'L/min',
          volumeUnit: 'L',
        },
      ]);
      return;
    }

    onChangeConditions(
      selectedConditions.filter(
        (item) => item.evaluationType !== option.evaluationType,
      ),
    );
  };

  const updateLab = (
    index: number,
    patch: Partial<HoMethodLaboratoryPayload>,
  ) => {
    onChangeLaboratories(
      laboratories.map((lab, idx) =>
        idx === index ? { ...lab, ...patch } : lab,
      ),
    );
  };

  const updateLabNumericInput = (
    index: number,
    field: LabNumericFieldKey,
    value: string,
  ) => {
    const key = buildLabNumericInputKey(index, field);
    onChangeLabNumericInputs({
      ...labNumericInputs,
      [key]: value,
    });
  };

  const getLabNumericValue = (index: number, field: LabNumericFieldKey) =>
    labNumericInputs[buildLabNumericInputKey(index, field)] ?? '';

  const handleAddLaboratory = () => {
    const nextLabs = [...laboratories, emptyLab()];
    onChangeLaboratories(nextLabs);
    const index = nextLabs.length - 1;
    const nextInputs = { ...labNumericInputs };
    for (const field of [
      ...FLOW_VOLUME_OVERRIDE_FIELDS,
      TEMPERATURE_OVERRIDE_FIELD,
      STABILITY_OVERRIDE_FIELD,
    ]) {
      nextInputs[buildLabNumericInputKey(index, field.key)] = '';
    }
    onChangeLabNumericInputs(nextInputs);
  };

  const handleRemoveLaboratory = (index: number) => {
    const nextLabs = laboratories.filter((_, idx) => idx !== index);
    onChangeLaboratories(nextLabs);
    onChangeLabNumericInputs(labNumericInputsFromLaboratories(nextLabs));
  };

  const selectedSamplerOptions = useMemo(() => samplerOptions, [samplerOptions]);
  const selectedSolventOptions = useMemo(() => solventOptions, [solventOptions]);
  const selectedLaboratoryOptions = useMemo(
    () => laboratoryOptions,
    [laboratoryOptions],
  );

  return (
    <>
      <Typography variant="subtitle2" gutterBottom>
        Condições de avaliação
        {activeAgentLabel ? ` — ${activeAgentLabel}` : ''}
      </Typography>
      {conditionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {conditionError}
        </Alert>
      )}
      {!evaluationDisplayOptions.length && !(selectedConditions ?? []).length ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Selecione um fator de risco com limites cadastrados para habilitar os
          tipos de avaliação possíveis.
        </Alert>
      ) : (
        <Box display="flex" flexDirection="column" gap={1} mb={3}>
          {evaluationDisplayOptions.map((option) => {
            const checked = selectedConditions.some(
              (item) => item.evaluationType === option.evaluationType,
            );
            return (
              <Paper key={option.evaluationType} variant="outlined" sx={{ p: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={(e) =>
                        toggleCondition(option, e.target.checked)
                      }
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">{option.label}</Typography>
                      {option.limitOrigin && (
                        <Typography variant="caption" color="text.secondary">
                          Origem: {option.limitOrigin}
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {formatLimitLine(option)}
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            );
          })}
        </Box>
      )}

      <Typography variant="subtitle2" gutterBottom>
        Laboratórios
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Valores laboratoriais específicos sobrepõem os parâmetros originais do
        método apenas para o laboratório selecionado.
      </Alert>

      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        {laboratories.map((lab, index) => (
          <Paper key={index} variant="outlined" sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle2">
                Laboratório {index + 1}
              </Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveLaboratory(index)}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {!lab.laboratoryId && lab.laboratoryName?.trim() && (
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    Texto legado: {lab.laboratoryName}. Selecione um laboratório
                    cadastrado para migrar este vínculo.
                  </Alert>
                )}
              </Grid>
              <Grid item xs={12} md={8}>
                <Box display="flex" gap={1} alignItems="flex-start">
                  <Box flex={1}>
                    <SAutocompleteSelect
                      label="Laboratório"
                      options={selectedLaboratoryOptions}
                      loading={loadingLaboratories}
                      filterOptions={(options) => options}
                      value={
                        selectedLaboratoryOptions.find(
                          (item) => item.id === lab.laboratoryId,
                        ) ?? null
                      }
                      getOptionLabel={(option) => getLaboratoryLabel(option)}
                      onInputChange={(_, value) => onLaboratorySearch(value)}
                      onChange={(_, value) =>
                        updateLab(index, {
                          laboratoryId: value?.id ?? null,
                          laboratoryName: value
                            ? getLaboratoryDisplayName(value)
                            : '',
                        })
                      }
                      placeholder="Buscar por nome, razão social ou CNPJ"
                    />
                  </Box>
                  <Button sx={{ mt: 4 }} onClick={onQuickCreateLaboratory}>
                    +
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Disponibilidade"
                  value={lab.availabilityStatus ?? 'UNKNOWN'}
                  onChange={(e) =>
                    updateLab(index, {
                      availabilityStatus: e.target
                        .value as HoMethodLaboratoryAvailabilityStatusEnum,
                    })
                  }
                >
                  {HO_METHOD_LAB_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Última confirmação"
                  InputLabelProps={{ shrink: true }}
                  value={lab.lastConfirmationDate ?? ''}
                  onChange={(e) =>
                    updateLab(index, {
                      lastConfirmationDate: e.target.value || null,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" gap={1} alignItems="flex-start">
                  <Box flex={1}>
                    <SAutocompleteSelect
                      label="Amostrador (override)"
                      options={selectedSamplerOptions}
                      loading={loadingSamplers}
                      filterOptions={(options) => options}
                      value={
                        selectedSamplerOptions.find(
                          (item) => item.id === lab.samplerId,
                        ) ?? null
                      }
                      getOptionLabel={(option) => option.name}
                      onChange={(_, value) =>
                        updateLab(index, { samplerId: value?.id ?? null })
                      }
                      placeholder="Usar padrão do método se vazio"
                    />
                  </Box>
                  <Button sx={{ mt: 4 }} onClick={onQuickCreateSampler}>
                    +
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" gap={1} alignItems="flex-start">
                  <Box flex={1}>
                    <SAutocompleteSelect
                      label="Solvente (override)"
                      options={selectedSolventOptions}
                      loading={loadingSolvents}
                      filterOptions={(options) => options}
                      value={
                        selectedSolventOptions.find(
                          (item) => item.id === lab.extractionSolventId,
                        ) ?? null
                      }
                      getOptionLabel={(option) => option.name}
                      onChange={(_, value) =>
                        updateLab(index, {
                          extractionSolventId: value?.id ?? null,
                        })
                      }
                      placeholder="Usar padrão do método se vazio"
                    />
                  </Box>
                  <Button sx={{ mt: 4 }} onClick={onQuickCreateSolvent}>
                    +
                  </Button>
                </Box>
              </Grid>
              {FLOW_VOLUME_OVERRIDE_FIELDS.map((field) => {
                const inputKey = buildLabNumericInputKey(index, field.key);
                const placeholderMap: Partial<
                  Record<LabNumericFieldKey, number | null | undefined>
                > = {
                  minimumFlowRateOverride: methodDefaults.minimumFlowRate,
                  maximumFlowRateOverride: methodDefaults.maximumFlowRate,
                  minimumVolumeOverride: methodDefaults.minimumVolume,
                  maximumVolumeOverride: methodDefaults.maximumVolume,
                };

                return (
                  <Grid item xs={12} md={3} key={field.key}>
                    <TextField
                      fullWidth
                      inputMode={field.inputMode}
                      label={field.label}
                      value={getLabNumericValue(index, field.key)}
                      placeholder={formatDefaultPlaceholder(
                        placeholderMap[field.key],
                      )}
                      error={Boolean(fieldErrors[inputKey])}
                      helperText={fieldErrors[inputKey]}
                      onChange={(e) =>
                        updateLabNumericInput(index, field.key, e.target.value)
                      }
                    />
                  </Grid>
                );
              })}
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  inputMode={TEMPERATURE_OVERRIDE_FIELD.inputMode}
                  label={TEMPERATURE_OVERRIDE_FIELD.label}
                  value={getLabNumericValue(
                    index,
                    TEMPERATURE_OVERRIDE_FIELD.key,
                  )}
                  placeholder={formatDefaultPlaceholder(
                    methodDefaults.storageTemperature,
                  )}
                  error={Boolean(
                    fieldErrors[
                      buildLabNumericInputKey(
                        index,
                        TEMPERATURE_OVERRIDE_FIELD.key,
                      )
                    ],
                  )}
                  helperText={
                    fieldErrors[
                      buildLabNumericInputKey(
                        index,
                        TEMPERATURE_OVERRIDE_FIELD.key,
                      )
                    ]
                  }
                  onChange={(e) =>
                    updateLabNumericInput(
                      index,
                      TEMPERATURE_OVERRIDE_FIELD.key,
                      e.target.value,
                    )
                  }
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Unidade temperatura override"
                  value={normalizeHoMethodTemperatureUnit(
                    lab.storageTemperatureUnitOverride ??
                      methodDefaults.storageTemperatureUnit,
                  )}
                  onChange={(e) =>
                    updateLab(index, {
                      storageTemperatureUnitOverride: e.target.value,
                    })
                  }
                >
                  {HO_METHOD_TEMPERATURE_UNIT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  inputMode={STABILITY_OVERRIDE_FIELD.inputMode}
                  label={STABILITY_OVERRIDE_FIELD.label}
                  value={getLabNumericValue(index, STABILITY_OVERRIDE_FIELD.key)}
                  placeholder={formatDefaultPlaceholder(
                    methodDefaults.stabilityDays,
                  )}
                  error={Boolean(
                    fieldErrors[
                      buildLabNumericInputKey(
                        index,
                        STABILITY_OVERRIDE_FIELD.key,
                      )
                    ],
                  )}
                  helperText={
                    fieldErrors[
                      buildLabNumericInputKey(
                        index,
                        STABILITY_OVERRIDE_FIELD.key,
                      )
                    ]
                  }
                  onChange={(e) =>
                    updateLabNumericInput(
                      index,
                      STABILITY_OVERRIDE_FIELD.key,
                      e.target.value,
                    )
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Observações do laboratório"
                  value={lab.notes ?? ''}
                  onChange={(e) => updateLab(index, { notes: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  label="Notas analíticas / adaptação implantada"
                  value={lab.analyticalNotes ?? ''}
                  onChange={(e) =>
                    updateLab(index, { analyticalNotes: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      <Button variant="outlined" onClick={handleAddLaboratory} sx={{ mb: 3 }}>
        Adicionar laboratório
      </Button>
    </>
  );
};
