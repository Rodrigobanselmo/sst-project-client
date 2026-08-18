import type { ChemicalProductListItem } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import {
  Alert,
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';

import {
  CHEMICAL_USE_SCENARIO_FREQUENCY_PERIODS,
  CHEMICAL_USE_SCENARIO_QUANTITY_UNITS,
  formatChemicalUseScenarioProductOption,
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

  return (
    <Stack spacing={1.5} mt={1}>
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
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          label="Frequência nº"
          value={values.frequencyCount}
          onChange={(event) =>
            patch(values, onChange, 'frequencyCount', event.target.value)
          }
          disabled={disabled}
          fullWidth
        />
        <FormControl fullWidth disabled={disabled}>
          <InputLabel>Frequência período</InputLabel>
          <Select
            label="Frequência período"
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
      </Stack>
      <TextField
        label="Duração (minutos)"
        value={values.durationMinutes}
        onChange={(event) =>
          patch(values, onChange, 'durationMinutes', event.target.value)
        }
        disabled={disabled}
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          label="Quantidade"
          value={values.quantity}
          onChange={(event) =>
            patch(values, onChange, 'quantity', event.target.value)
          }
          disabled={disabled}
          fullWidth
          helperText="Texto livre. Ex.: até 10"
        />
        <FormControl fullWidth disabled={disabled}>
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
      </Stack>
      <TextField
        label="Momento de maior contato"
        value={values.peakContactMoment}
        onChange={(event) =>
          patch(values, onChange, 'peakContactMoment', event.target.value)
        }
        disabled={disabled}
      />
      <TextField
        label="Medidas de controle"
        value={values.controlMeasures}
        onChange={(event) =>
          patch(values, onChange, 'controlMeasures', event.target.value)
        }
        disabled={disabled}
        multiline
        minRows={2}
      />
      {error ? <Alert severity="error">{error}</Alert> : null}
    </Stack>
  );
};
