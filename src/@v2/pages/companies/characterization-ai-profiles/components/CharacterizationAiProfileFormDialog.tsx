import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type {
  CharacterizationAiProfileDto,
  CharacterizationAiProfileFieldInstructions,
} from '@v2/services/security/characterization/characterization-ai-profile/service/characterization-ai-profile.types';
import { useMutateCharacterizationAiProfile } from '@v2/services/security/characterization/characterization-ai-profile/hooks/useMutateCharacterizationAiProfile';
import { characterizationMap } from 'core/constants/maps/characterization.map';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';
import { useEffect, useState } from 'react';

import { CHARACTERIZATION_AI_SPECIALIST_CATEGORIES } from '../constants/characterization-ai-specialist-category.constants';

const ALL_TYPES = Object.values(CharacterizationTypeEnum);

export type CharacterizationAiProfileFormValues = {
  name: string;
  category: string;
  objective: string;
  description: string;
  usageGuidance: string;
  recommendedCharacterizationTypes: CharacterizationTypeEnum[];
  fieldInstructions: CharacterizationAiProfileFieldInstructions;
  instructions: string;
  internalNotes: string;
};

const emptyFieldInstructions = (): CharacterizationAiProfileFieldInstructions => ({
  description: '',
  workActivities: '',
  photos: '',
  considerations: '',
});

const emptyForm = (): CharacterizationAiProfileFormValues => ({
  name: '',
  category: '',
  objective: '',
  description: '',
  usageGuidance: '',
  recommendedCharacterizationTypes: [],
  fieldInstructions: emptyFieldInstructions(),
  instructions: '',
  internalNotes: '',
});

function profileToForm(
  profile: CharacterizationAiProfileDto,
): CharacterizationAiProfileFormValues {
  return {
    name: profile.name,
    category: profile.category ?? '',
    objective: profile.objective ?? '',
    description: profile.description ?? '',
    usageGuidance: profile.usageGuidance ?? '',
    recommendedCharacterizationTypes: profile.recommendedCharacterizationTypes ?? [],
    fieldInstructions: profile.fieldInstructions ?? emptyFieldInstructions(),
    instructions: profile.instructions,
    internalNotes: profile.internalNotes ?? '',
  };
}

function serializeFieldInstructions(
  fields: CharacterizationAiProfileFieldInstructions,
): CharacterizationAiProfileFieldInstructions | null {
  const normalized = {
    description: fields.description.trim(),
    workActivities: fields.workActivities.trim(),
    photos: fields.photos.trim(),
    considerations: fields.considerations.trim(),
  };
  if (
    !normalized.description &&
    !normalized.workActivities &&
    !normalized.photos &&
    !normalized.considerations
  ) {
    return null;
  }
  return normalized;
}

type Props = {
  open: boolean;
  companyId: string;
  profile?: CharacterizationAiProfileDto | null;
  initialValues?: Partial<CharacterizationAiProfileFormValues>;
  /** When creating from assisted draft, mark origin as ASSISTED_DRAFT. */
  createSourceKind?: 'MANUAL' | 'ASSISTED_DRAFT';
  onClose: () => void;
  onSaved?: () => void;
};

export function CharacterizationAiProfileFormDialog({
  open,
  companyId,
  profile,
  initialValues,
  createSourceKind = 'MANUAL',
  onClose,
  onSaved,
}: Props) {
  const { create, update } = useMutateCharacterizationAiProfile();
  const [form, setForm] = useState<CharacterizationAiProfileFormValues>(emptyForm);

  useEffect(() => {
    if (!open) return;
    if (profile) {
      setForm(profileToForm(profile));
    } else {
      setForm({
        ...emptyForm(),
        ...initialValues,
        fieldInstructions: {
          ...emptyFieldInstructions(),
          ...initialValues?.fieldInstructions,
        },
      });
    }
  }, [open, profile, initialValues]);

  const isPending = create.isPending || update.isPending;
  const isEdit = Boolean(profile?.id);

  const handleSave = async () => {
    if (!form.name.trim() || !form.objective.trim() || !form.instructions.trim()) {
      return;
    }

    const payload = {
      name: form.name.trim(),
      objective: form.objective.trim(),
      instructions: form.instructions.trim(),
      description: form.description.trim() || null,
      usageGuidance: form.usageGuidance.trim() || null,
      fieldInstructions: serializeFieldInstructions(form.fieldInstructions),
      recommendedCharacterizationTypes: form.recommendedCharacterizationTypes,
      category: form.category.trim() || null,
      internalNotes: form.internalNotes.trim() || null,
      ...(!isEdit ? { sourceKind: createSourceKind } : {}),
    };

    if (isEdit && profile) {
      await update.mutateAsync({
        companyId,
        profileId: profile.id,
        ...payload,
      });
    } else {
      await create.mutateAsync({
        companyId,
        ...payload,
      });
    }

    onSaved?.();
    onClose();
  };

  const updateFieldInstruction = (
    key: keyof CharacterizationAiProfileFieldInstructions,
    value: string,
  ) => {
    setForm((f) => ({
      ...f,
      fieldInstructions: { ...f.fieldInstructions, [key]: value },
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Editar especialista de IA' : 'Novo especialista'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nome do especialista"
            required
            fullWidth
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <FormControl fullWidth>
            <InputLabel id="profile-category-label">Categoria</InputLabel>
            <Select
              labelId="profile-category-label"
              label="Categoria"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
            >
              <MenuItem value="">
                <em>Nenhuma</em>
              </MenuItem>
              {CHARACTERIZATION_AI_SPECIALIST_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Objetivo técnico"
            required
            fullWidth
            multiline
            minRows={2}
            value={form.objective}
            onChange={(e) =>
              setForm((f) => ({ ...f, objective: e.target.value }))
            }
          />
          <TextField
            label="Descrição"
            fullWidth
            multiline
            minRows={2}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <TextField
            label="Quando utilizar"
            fullWidth
            multiline
            minRows={2}
            value={form.usageGuidance}
            onChange={(e) =>
              setForm((f) => ({ ...f, usageGuidance: e.target.value }))
            }
          />
          <FormControl fullWidth>
            <InputLabel id="profile-types-label">Tipos recomendados</InputLabel>
            <Select
              labelId="profile-types-label"
              label="Tipos recomendados"
              multiple
              value={form.recommendedCharacterizationTypes}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  recommendedCharacterizationTypes: e.target
                    .value as CharacterizationTypeEnum[],
                }))
              }
              renderValue={(selected) =>
                (selected as CharacterizationTypeEnum[])
                  .map((t) => characterizationMap[t]?.name ?? t)
                  .join(', ')
              }
            >
              {ALL_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {characterizationMap[type]?.name ?? type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2" sx={{ pt: 1 }}>
            Orientações por bloco
          </Typography>
          <TextField
            label="Descrição"
            fullWidth
            multiline
            minRows={2}
            value={form.fieldInstructions.description}
            onChange={(e) => updateFieldInstruction('description', e.target.value)}
          />
          <TextField
            label="Processos e atividades"
            fullWidth
            multiline
            minRows={2}
            value={form.fieldInstructions.workActivities}
            onChange={(e) =>
              updateFieldInstruction('workActivities', e.target.value)
            }
          />
          <TextField
            label="Orientações para interpretação das fotografias"
            helperText="Não gera texto no documento. Orienta a IA a usar fotos como evidência para Descrição, Processos e Considerações."
            fullWidth
            multiline
            minRows={2}
            value={form.fieldInstructions.photos}
            onChange={(e) => updateFieldInstruction('photos', e.target.value)}
          />
          <TextField
            label="Considerações"
            fullWidth
            multiline
            minRows={2}
            value={form.fieldInstructions.considerations}
            onChange={(e) =>
              updateFieldInstruction('considerations', e.target.value)
            }
          />

          <TextField
            label="Regras gerais"
            required
            fullWidth
            multiline
            minRows={6}
            value={form.instructions}
            onChange={(e) =>
              setForm((f) => ({ ...f, instructions: e.target.value }))
            }
          />
          <TextField
            label="Notas internas"
            fullWidth
            multiline
            minRows={2}
            value={form.internalNotes}
            onChange={(e) =>
              setForm((f) => ({ ...f, internalNotes: e.target.value }))
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={
            isPending ||
            !form.name.trim() ||
            !form.objective.trim() ||
            !form.instructions.trim()
          }
          onClick={() => void handleSave()}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
