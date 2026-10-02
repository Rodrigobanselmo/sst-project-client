import { FC, useState } from 'react';

import { Box, MenuItem, TextField } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SText from 'components/atoms/SText';

import {
  COMPANY_SHIFT_DURATION_CHANGE_WARNING,
  COMPANY_SHIFT_PRESETS,
} from 'core/constants/company-shift-presets.constant';
import {
  didCompanyShiftDurationChange,
  durationMinutesFromInput,
  findCompanyShiftPreset,
} from 'core/constants/company-shift-presets.util';
import { useMutUpsertCompanyShift } from 'core/services/hooks/mutations/manager/useMutUpsertCompanyShift';
import {
  CompanyShift,
  useQueryCompanyShifts,
} from 'core/services/hooks/queries/useQueryCompanyShifts';

type Draft = {
  id?: number;
  name: string;
  description: string;
  duration: string;
  originalDurationMinutes?: number | null;
};

const emptyDraft = (): Draft => ({ name: '', description: '', duration: '' });

export type CompanyShiftsPanelProps = {
  /** Título do bloco. Default: Turnos da empresa. */
  title?: string;
};

export const CompanyShiftsPanel: FC<CompanyShiftsPanelProps> = ({
  title = 'Turnos da empresa',
}) => {
  const { data: shifts } = useQueryCompanyShifts();
  const save = useMutUpsertCompanyShift();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [presetId, setPresetId] = useState('');
  const [error, setError] = useState('');

  const isEditing = Boolean(draft.id);

  const resetForm = () => {
    setDraft(emptyDraft());
    setPresetId('');
    setError('');
  };

  const startEdit = (shift: CompanyShift) => {
    setError('');
    setPresetId('');
    setDraft({
      id: shift.id,
      name: shift.name,
      description: shift.description || '',
      duration: shift.durationMinutes ? String(shift.durationMinutes) : '',
      originalDurationMinutes: shift.durationMinutes ?? null,
    });
  };

  const applyPreset = (id: string) => {
    setPresetId(id);
    const preset = findCompanyShiftPreset(id);
    if (!preset) return;
    setError('');
    setDraft((current) => ({
      ...current,
      id: undefined,
      originalDurationMinutes: undefined,
      name: preset.name,
      description: preset.description,
      duration: String(preset.durationMinutes),
    }));
  };

  const onSave = async () => {
    const name = draft.name.trim();
    if (!name) {
      setError('Informe o nome do turno.');
      return;
    }
    const durationMinutes = durationMinutesFromInput(draft.duration);
    if (durationMinutes === undefined) {
      setError('A duração deve ser um inteiro positivo, em minutos.');
      return;
    }

    if (
      isEditing &&
      didCompanyShiftDurationChange(draft.originalDurationMinutes, durationMinutes)
    ) {
      const confirmed = window.confirm(COMPANY_SHIFT_DURATION_CHANGE_WARNING);
      if (!confirmed) return;
    }

    setError('');
    await save.mutateAsync({
      id: draft.id,
      name,
      description: draft.description.trim() || null,
      durationMinutes,
    });
    resetForm();
  };

  return (
    <Box mb={4} p={2} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <SText fontSize={16} fontWeight={600} mb={1}>
        {title}
      </SText>
      <SText fontSize={12} color="text.secondary" mb={2}>
        Duração da jornada em minutos. Deixe em branco quando a jornada ainda não estiver
        estruturada.
      </SText>
      {shifts.map((shift) => (
        <Box key={shift.id} display="flex" gap={2} alignItems="center" mb={1}>
          <SText fontSize={14} sx={{ minWidth: 160 }}>
            {shift.name}
          </SText>
          <SText fontSize={13} color="text.secondary">
            {shift.durationMinutes ? `${shift.durationMinutes} min` : 'Jornada não estruturada'}
          </SText>
          <SButton size="small" variant="text" onClick={() => startEdit(shift)}>
            Editar
          </SButton>
        </Box>
      ))}
      <Box display="flex" flexWrap="wrap" gap={2} mt={2} alignItems="flex-start">
        {!isEditing ? (
          <TextField
            select
            size="small"
            label="Usar modelo"
            value={presetId}
            onChange={(event) => applyPreset(event.target.value)}
            sx={{ minWidth: 280 }}
            helperText="Opcional. Preenche os campos; nada é salvo até confirmar."
          >
            <MenuItem value="">
              <em>Nenhum</em>
            </MenuItem>
            {COMPANY_SHIFT_PRESETS.map((preset) => (
              <MenuItem key={preset.id} value={preset.id}>
                {preset.name}
              </MenuItem>
            ))}
          </TextField>
        ) : null}
        <TextField
          size="small"
          label="Nome do turno"
          value={draft.name}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          sx={{ minWidth: 200 }}
        />
        <TextField
          size="small"
          label="Descrição"
          value={draft.description}
          onChange={(event) =>
            setDraft((current) => ({ ...current, description: event.target.value }))
          }
          sx={{ minWidth: 240, flex: 1 }}
        />
        <TextField
          size="small"
          label="Duração da jornada (minutos)"
          value={draft.duration}
          inputProps={{ inputMode: 'numeric' }}
          onChange={(event) =>
            setDraft((current) => ({ ...current, duration: event.target.value }))
          }
        />
        <SButton variant="contained" onClick={onSave} loading={save.isLoading}>
          {isEditing ? 'Atualizar turno' : 'Adicionar turno'}
        </SButton>
        {isEditing ? (
          <SButton variant="text" onClick={resetForm}>
            Cancelar edição
          </SButton>
        ) : null}
      </Box>
      {error ? (
        <SText fontSize={12} color="error.main" mt={1}>
          {error}
        </SText>
      ) : null}
    </Box>
  );
};
