import { useRef, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { updateChemicalUseScenario } from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalUseScenarioBoardRow,
  UpdateChemicalUseScenarioPayload,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  CHEMICAL_USE_SCENARIO_FREQUENCY_PERIODS,
  CHEMICAL_USE_SCENARIO_QUANTITY_UNITS,
  formatManualChemicalUseScenarioQuantity,
} from './chemical-use-scenario-form.util';
import { parseChemicalScenarioQuantity } from './chemical-use-scenario-quantity.util';

type Field = 'frequency' | 'duration' | 'quantity';

type Props = {
  field: Field;
  scenario: ChemicalUseScenarioBoardRow;
  companyId: string;
  workspaceId: string;
  onSaved: (patch: UpdateChemicalUseScenarioPayload) => void;
};

const labels = {
  frequency: 'frequência',
  duration: 'duração',
  quantity: 'quantidade',
};

const messages = {
  frequency: 'Informe uma frequência positiva e o período.',
  duration: 'A duração precisa ser maior que 0 min.',
  quantity: 'Informe uma quantidade positiva e a unidade.',
};

export function ChemicalScenarioMissingInput({
  field,
  scenario,
  companyId,
  workspaceId,
  onSaved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [option, setOption] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const savingRef = useRef(false);
  const options: readonly string[] =
    field === 'frequency'
      ? CHEMICAL_USE_SCENARIO_FREQUENCY_PERIODS
      : CHEMICAL_USE_SCENARIO_QUANTITY_UNITS;

  function start() {
    const storedQuantity = parseChemicalScenarioQuantity(scenario.quantity);
    const storedValue =
      field === 'duration'
        ? scenario.durationMinutes
        : field === 'frequency'
          ? scenario.frequencyCount
          : storedQuantity;
    const storedOption =
      field === 'frequency' ? scenario.frequencyPeriod : scenario.quantityUnit;
    setValue(storedValue && storedValue > 0 ? String(storedValue) : '');
    setOption(
      options.find(
        (item) => item.toLowerCase() === storedOption?.trim().toLowerCase(),
      ) ?? '',
    );
    setError(false);
    setOpen(true);
  }

  const parsed = formatManualChemicalUseScenarioQuantity(value);
  const number = parsed.ok && parsed.value !== null ? Number(parsed.value) : 0;
  const valid =
    number > 0 && (field === 'duration' || options.includes(option));

  async function save() {
    if (!valid || savingRef.current) return;
    const patch: UpdateChemicalUseScenarioPayload =
      field === 'duration'
        ? { durationMinutes: number }
        : field === 'frequency'
          ? { frequencyCount: number, frequencyPeriod: option }
          : { quantity: String(number), quantityUnit: option };

    savingRef.current = true;
    setSaving(true);
    setError(false);
    try {
      const saved = await updateChemicalUseScenario({
        companyId,
        workspaceId,
        scenarioId: scenario.id,
        ...patch,
      });
      onSaved(
        field === 'duration'
          ? { durationMinutes: saved.durationMinutes }
          : field === 'frequency'
            ? {
                frequencyCount: saved.frequencyCount,
                frequencyPeriod: saved.frequencyPeriod,
              }
            : { quantity: saved.quantity, quantityUnit: saved.quantityUnit },
      );
      setOpen(false);
    } catch {
      setError(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <>
      <Typography variant="caption" display="block" color="error.dark">
        {messages[field]}
      </Typography>
      {scenario.kind === 'SCENARIO' && (
        <Button size="small" onClick={start}>
          Editar {labels[field]}
        </Button>
      )}
      {open && (
        <Dialog
          open
          fullWidth
          maxWidth="xs"
          onClose={() => {
            if (!savingRef.current) setOpen(false);
          }}
        >
          <DialogTitle>Editar {labels[field]} da atividade</DialogTitle>
          <DialogContent>
            <Stack spacing={4} sx={{ pt: 2 }}>
              <Typography variant="body2">{scenario.activityName}</Typography>
              {error && (
                <Alert severity="error">
                  Não foi possível salvar a alteração. Tente novamente.
                </Alert>
              )}
              <TextField
                autoFocus
                label={
                  field === 'duration'
                    ? 'Duração (min)'
                    : field === 'frequency'
                      ? 'Ocorrências'
                      : 'Quantidade'
                }
                value={value}
                disabled={saving}
                onChange={(event) => setValue(event.target.value)}
                inputProps={{ inputMode: 'decimal' }}
              />
              {field !== 'duration' && (
                <TextField
                  select
                  label={field === 'frequency' ? 'Período' : 'Unidade'}
                  value={option}
                  disabled={saving}
                  onChange={(event) => setOption(event.target.value)}
                >
                  {options.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button disabled={saving} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={!valid || saving}
              onClick={() => void save()}
            >
              {saving ? 'Salvando…' : 'Salvar no cenário'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
