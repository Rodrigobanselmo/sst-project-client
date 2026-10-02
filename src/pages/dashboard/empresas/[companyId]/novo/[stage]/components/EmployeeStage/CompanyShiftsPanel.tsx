import { FC, useState } from 'react';

import { Box, TextField } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SText from 'components/atoms/SText';

import { CompanyShift, useQueryCompanyShifts } from 'core/services/hooks/queries/useQueryCompanyShifts';
import { useMutUpsertCompanyShift } from 'core/services/hooks/mutations/manager/useMutUpsertCompanyShift';

type Draft = {
  id?: number;
  name: string;
  description: string;
  duration: string;
};

const emptyDraft = (): Draft => ({ name: '', description: '', duration: '' });

function durationFromInput(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^[1-9]\d*$/.test(trimmed)) return undefined;
  return Number(trimmed);
}

export const CompanyShiftsPanel: FC = () => {
  const { data: shifts } = useQueryCompanyShifts();
  const save = useMutUpsertCompanyShift();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState('');

  const startEdit = (shift: CompanyShift) => {
    setError('');
    setDraft({
      id: shift.id,
      name: shift.name,
      description: shift.description || '',
      duration: shift.durationMinutes ? String(shift.durationMinutes) : '',
    });
  };

  const onSave = async () => {
    const name = draft.name.trim();
    if (!name) {
      setError('Informe o nome do turno.');
      return;
    }
    const durationMinutes = durationFromInput(draft.duration);
    if (durationMinutes === undefined) {
      setError('A duração deve ser um inteiro positivo, em minutos.');
      return;
    }
    setError('');
    await save.mutateAsync({
      id: draft.id,
      name,
      description: draft.description.trim() || null,
      durationMinutes,
    });
    setDraft(emptyDraft());
  };

  return (
    <Box mb={4} p={2} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <SText fontSize={16} fontWeight={600} mb={1}>
        Turnos da empresa
      </SText>
      <SText fontSize={12} color="text.secondary" mb={2}>
        Duração da jornada em minutos. Deixe em branco quando a jornada ainda não estiver estruturada.
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
        <TextField
          size="small"
          label="Nome do turno"
          value={draft.name}
          onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
        />
        <TextField
          size="small"
          label="Descrição"
          value={draft.description}
          onChange={(event) =>
            setDraft((current) => ({ ...current, description: event.target.value }))
          }
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
          {draft.id ? 'Atualizar turno' : 'Adicionar turno'}
        </SButton>
        {draft.id ? (
          <SButton variant="text" onClick={() => setDraft(emptyDraft())}>
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
