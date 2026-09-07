import type { ChemicalProductListItem } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Alert,
  Autocomplete,
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import type { ReactNode } from 'react';

import {
  CHEMICAL_USE_SCENARIO_DURATION_UNIT_LABEL,
  CHEMICAL_USE_SCENARIO_FREQUENCY_PERIODS,
  CHEMICAL_USE_SCENARIO_QUANTITY_UNITS,
  formatChemicalUseScenarioProductOption,
  getChemicalUseScenarioDurationFieldState,
  getChemicalUseScenarioFrequencyFieldState,
  getChemicalUseScenarioQuantityFieldState,
  type ChemicalUseScenarioFormMode,
  type ChemicalUseScenarioFormValues,
} from './chemical-use-scenario-form.util';

type Props = {
  mode: ChemicalUseScenarioFormMode;
  productLocked?: boolean;
  values: ChemicalUseScenarioFormValues;
  onChange: (values: ChemicalUseScenarioFormValues) => void;
  products: ChemicalProductListItem[];
  productsLoading?: boolean;
  disabled?: boolean;
  error?: string | null;
};

function patch(
  values: ChemicalUseScenarioFormValues,
  onChange: Props['onChange'],
  field: keyof ChemicalUseScenarioFormValues,
  value: ChemicalUseScenarioFormValues[keyof ChemicalUseScenarioFormValues],
) {
  onChange({ ...values, [field]: value });
}

function MeasurePairBlock({
  error = false,
  helperText,
  children,
}: {
  error?: boolean;
  helperText?: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        flex: { xs: '1 1 100%', md: '1 1 0' },
        minWidth: { xs: 0, md: 220 },
        px: 1.25,
        pt: 0.75,
        pb: 0.75,
        borderRadius: 1,
        bgcolor: 'action.hover',
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="flex-start">
        {children}
      </Stack>
      {helperText ? (
        <FormHelperText error={error} sx={{ mx: 0.25, mt: 0.5, mb: 0 }}>
          {helperText}
        </FormHelperText>
      ) : null}
    </Box>
  );
}

export const ChemicalUseScenarioForm = ({
  mode,
  productLocked = false,
  values,
  onChange,
  products,
  productsLoading = false,
  disabled = false,
  error = null,
}: Props) => {
  const lockProduct = productLocked || mode === 'edit' || disabled;
  const frequencyField = getChemicalUseScenarioFrequencyFieldState(
    values.frequencyCount,
  );
  const durationField = getChemicalUseScenarioDurationFieldState(
    values.durationMinutes,
  );
  const quantityField = getChemicalUseScenarioQuantityFieldState(
    values.quantity,
  );

  return (
    <Stack>
      <Stack spacing={2.5}>
        <Autocomplete
          options={products}
          value={values.product}
          onChange={(_, value) => patch(values, onChange, 'product', value)}
          getOptionLabel={(option) =>
            option ? formatChemicalUseScenarioProductOption(option) : ''
          }
          isOptionEqualToValue={(a, b) => a.id === b.id}
          disabled={lockProduct}
          loading={productsLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              required
              label="Produto químico"
              helperText="Somente produtos já cadastrados neste estabelecimento."
              sx={{
                '& .MuiAutocomplete-input': {
                  fontWeight: values.product ? 600 : 400,
                },
              }}
            />
          )}
        />
        <TextField
          required
          label="Tarefa / atividade"
          value={values.activityName}
          onChange={(event) =>
            patch(values, onChange, 'activityName', event.target.value)
          }
          disabled={disabled}
        />
        <TextField
          label="Setor"
          value={values.sectorSnapshot}
          onChange={(event) =>
            patch(values, onChange, 'sectorSnapshot', event.target.value)
          }
          disabled={disabled}
        />
        <TextField
          label="GSE"
          value={values.exposureGroupSnapshot}
          onChange={(event) =>
            patch(values, onChange, 'exposureGroupSnapshot', event.target.value)
          }
          disabled={disabled}
          helperText="Snapshot textual. Não cria GSE estrutural."
        />
        <TextField
          label="Cargos expostos"
          value={values.exposedRolesSnapshot}
          onChange={(event) =>
            patch(values, onChange, 'exposedRolesSnapshot', event.target.value)
          }
          disabled={disabled}
        />
      </Stack>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        useFlexGap
        flexWrap="wrap"
        alignItems="stretch"
        sx={{ mt: 1.5, mb: 2, gap: 2.5 }}
      >
        <MeasurePairBlock
          error={frequencyField.error}
          helperText={frequencyField.helperText || undefined}
        >
          <TextField
            label="Frequência"
            value={values.frequencyCount}
            onChange={(event) =>
              patch(values, onChange, 'frequencyCount', event.target.value)
            }
            disabled={disabled}
            error={frequencyField.error}
            sx={{ width: 88, flex: '0 0 88px' }}
          />
          <FormControl sx={{ flex: '1 1 128px', minWidth: 112 }} disabled={disabled}>
            <InputLabel>Período</InputLabel>
            <Select
              label="Período"
              value={values.frequencyPeriod}
              onChange={(event) =>
                patch(values, onChange, 'frequencyPeriod', event.target.value)
              }
            >
              <MenuItem value="">
                <em>—</em>
              </MenuItem>
              {CHEMICAL_USE_SCENARIO_FREQUENCY_PERIODS.map((period) => (
                <MenuItem key={period} value={period}>
                  {period}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MeasurePairBlock>
        <MeasurePairBlock
          error={durationField.error}
          helperText={durationField.helperText}
        >
          <TextField
            label="Duração"
            value={values.durationMinutes}
            onChange={(event) =>
              patch(values, onChange, 'durationMinutes', event.target.value)
            }
            disabled={disabled}
            error={durationField.error}
            sx={{ width: 88, flex: '0 0 88px' }}
          />
          <TextField
            label=" "
            value={CHEMICAL_USE_SCENARIO_DURATION_UNIT_LABEL}
            disabled
            inputProps={{ 'aria-label': 'Unidade de duração' }}
            sx={{ flex: '1 1 104px', minWidth: 96 }}
          />
        </MeasurePairBlock>
        <MeasurePairBlock
          error={quantityField.error}
          helperText={quantityField.helperText || undefined}
        >
          <TextField
            label="Quantidade"
            value={values.quantity}
            onChange={(event) =>
              patch(values, onChange, 'quantity', event.target.value)
            }
            disabled={disabled}
            error={quantityField.error}
            sx={{ width: 88, flex: '0 0 88px' }}
          />
          <FormControl sx={{ flex: '1 1 96px', minWidth: 80 }} disabled={disabled}>
            <InputLabel>Unidade</InputLabel>
            <Select
              label="Unidade"
              value={values.quantityUnit}
              onChange={(event) =>
                patch(values, onChange, 'quantityUnit', event.target.value)
              }
            >
              <MenuItem value="">
                <em>—</em>
              </MenuItem>
              {CHEMICAL_USE_SCENARIO_QUANTITY_UNITS.map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </MeasurePairBlock>
      </Stack>
      <Stack spacing={1.5}>
        <TextField
          label="Momento de maior contato"
          value={values.peakContactMoment}
          onChange={(event) =>
            patch(values, onChange, 'peakContactMoment', event.target.value)
          }
          disabled={disabled}
          multiline
          minRows={3}
        />
        <TextField
          label="Medidas de controle"
          value={values.controlMeasures}
          onChange={(event) =>
            patch(values, onChange, 'controlMeasures', event.target.value)
          }
          disabled={disabled}
          multiline
          minRows={3}
        />
        {error ? <Alert severity="error">{error}</Alert> : null}
      </Stack>
    </Stack>
  );
};
