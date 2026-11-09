import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormStructureInput } from '@v2/services/forms/form-structures/form-structures.service';
import { useState } from 'react';
import { v4 } from 'uuid';

const newDimension = () => ({ id: v4(), name: '' });
const newScale = () => ({ id: v4(), name: '', dimensions: [newDimension()] });

export function FormStructureDialog({
  initial,
  readOnly = false,
  busy = false,
  submitLabel = 'Salvar estrutura',
  onClose,
  onSubmit,
}: {
  initial?: FormStructureInput;
  readOnly?: boolean;
  busy?: boolean;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (input: FormStructureInput) => void;
}) {
  const [draft, setDraft] = useState<FormStructureInput>(
    () => initial ?? { name: '', scales: [newScale()] },
  );

  const valid =
    draft.name.trim() &&
    draft.scales.every(
      (scale) =>
        scale.name.trim() && scale.dimensions.every(({ name }) => name.trim()),
    );
  const editScale = (
    id: string,
    edit: (
      scale: FormStructureInput['scales'][number],
    ) => FormStructureInput['scales'][number],
  ) =>
    setDraft((current) => ({
      ...current,
      scales: current.scales.map((scale) =>
        scale.id === id ? edit(scale) : scale,
      ),
    }));

  return (
    <Dialog
      open
      fullWidth
      maxWidth="md"
      onClose={busy ? undefined : onClose}
      aria-labelledby="form-structure-title"
    >
      <DialogTitle id="form-structure-title">
        {readOnly
          ? 'Estrutura de escalas e dimensões'
          : initial
            ? 'Editar estrutura'
            : 'Nova estrutura'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack gap={5}>
          <TextField
            fullWidth
            size="small"
            label="Nome da estrutura"
            value={draft.name}
            inputProps={{ maxLength: 160, readOnly }}
            onChange={(event) =>
              setDraft({ ...draft, name: event.target.value })
            }
          />
          {draft.scales.map((scale, scaleIndex) => (
            <Stack
              key={scale.id}
              gap={3}
              sx={{ p: 4, border: 1, borderColor: 'divider', borderRadius: 2 }}
            >
              <Stack direction="row" gap={2}>
                <TextField
                  fullWidth
                  size="small"
                  label={`Escala ${scaleIndex + 1}`}
                  value={scale.name}
                  inputProps={{ maxLength: 160, readOnly }}
                  onChange={(event) =>
                    editScale(scale.id, (current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
                {!readOnly && (
                  <Button
                    color="error"
                    disabled={draft.scales.length === 1}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        scales: draft.scales.filter(
                          ({ id }) => id !== scale.id,
                        ),
                      })
                    }
                  >
                    Remover
                  </Button>
                )}
              </Stack>
              <Box sx={{ pl: 5 }}>
                <Typography variant="caption" color="text.secondary">
                  Dimensões da escala
                </Typography>
                <Stack gap={3} mt={2}>
                  {scale.dimensions.map((dimension, dimensionIndex) => (
                    <Stack key={dimension.id} direction="row" gap={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label={`Dimensão ${dimensionIndex + 1}`}
                        value={dimension.name}
                        inputProps={{ maxLength: 160, readOnly }}
                        onChange={(event) =>
                          editScale(scale.id, (current) => ({
                            ...current,
                            dimensions: current.dimensions.map((item) =>
                              item.id === dimension.id
                                ? { ...item, name: event.target.value }
                                : item,
                            ),
                          }))
                        }
                      />
                      {!readOnly && (
                        <Button
                          color="error"
                          disabled={scale.dimensions.length === 1}
                          onClick={() =>
                            editScale(scale.id, (current) => ({
                              ...current,
                              dimensions: current.dimensions.filter(
                                ({ id }) => id !== dimension.id,
                              ),
                            }))
                          }
                        >
                          Remover
                        </Button>
                      )}
                    </Stack>
                  ))}
                  {!readOnly && (
                    <Button
                      sx={{ alignSelf: 'flex-start' }}
                      disabled={scale.dimensions.length >= 100}
                      onClick={() =>
                        editScale(scale.id, (current) => ({
                          ...current,
                          dimensions: [...current.dimensions, newDimension()],
                        }))
                      }
                    >
                      Adicionar dimensão
                    </Button>
                  )}
                </Stack>
              </Box>
            </Stack>
          ))}
          {!readOnly && (
            <Button
              sx={{ alignSelf: 'flex-start' }}
              disabled={draft.scales.length >= 100}
              onClick={() =>
                setDraft({ ...draft, scales: [...draft.scales, newScale()] })
              }
            >
              Adicionar escala
            </Button>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          {readOnly ? 'Fechar' : 'Cancelar'}
        </Button>
        {!readOnly && (
          <Button
            variant="contained"
            disabled={!valid || busy}
            onClick={() => onSubmit(draft)}
          >
            {submitLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
