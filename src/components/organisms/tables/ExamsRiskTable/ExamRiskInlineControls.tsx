import type { Dispatch, SetStateAction } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  inlineParameterFields,
  inlineParameterLabels,
  inlineDegreeOptions,
  type InlineParameterGroup,
  type InlineParameterDraft,
} from './exam-risk-inline-parameter.util';

type Props = {
  group: InlineParameterGroup;
  draft: InlineParameterDraft;
  setDraft: Dispatch<SetStateAction<InlineParameterDraft>>;
  pending: boolean;
  link: { id: string | number; isPeriodic?: boolean };
  onSave: () => void | Promise<void>;
  onCancel: () => void;
  library?: boolean;
};
export function ExamRiskInlineControls({
  group,
  draft,
  setDraft,
  pending,
  link,
  onSave,
  onCancel,
  library = false,
}: Props) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !pending) {
          onCancel();
        }
      }}
    >
      {(group === 'events' || group === 'sex') &&
        inlineParameterFields[group].map((field, index) => (
          <FormControlLabel
            key={field}
            control={
              <Checkbox
                size="small"
                disabled={pending}
                checked={draft[field] === true}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [field]: event.target.checked,
                  }))
                }
              />
            }
            label={
              group === 'events'
                ? [
                    'Admissional',
                    'Periódico',
                    'Mudança',
                    'Retorno',
                    'Demissional',
                  ][index]
                : ['Masculino', 'Feminino'][index]
            }
          />
        ))}
      {((group === 'events' && draft.isPeriodic === true) ||
        group === 'validityInMonths' ||
        group === 'considerBetweenDays' ||
        group === 'age') &&
        (group === 'age'
          ? ['fromAge', 'toAge']
          : [group === 'events' ? 'validityInMonths' : group]
        ).map((field) => (
          <TextField
            key={field}
            autoFocus={field === (group === 'age' ? 'fromAge' : group)}
            type="number"
            size="small"
            label={
              field === 'fromAge'
                ? 'Idade inicial'
                : field === 'toAge'
                  ? 'Idade final'
                  : field === 'validityInMonths'
                    ? 'Periodicidade (meses)'
                    : 'Intervalo em dias'
            }
            value={draft[field] ?? ''}
            disabled={pending}
            inputProps={{
              min:
                !library &&
                field === 'validityInMonths' &&
                (group === 'events' ? draft.isPeriodic : link.isPeriodic)
                  ? 1
                  : 0,
              step: 1,
              'aria-label': `${field}, ${library ? 'item da Biblioteca' : 'vínculo'} ${link.id}`,
            }}
            sx={{ width: 170 }}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                [field]: event.target.value,
              }))
            }
          />
        ))}
      {(group === 'minRiskDegree' || group === 'minRiskDegreeQuantity') && (
        <TextField
          select
          autoFocus
          size="small"
          label={inlineParameterLabels[group]}
          value={draft[group] ?? ''}
          disabled={pending}
          sx={{ minWidth: 170 }}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              [group]: event.target.value,
            }))
          }
        >
          <MenuItem value="" disabled={!library}>
            {library ? 'Não informado' : 'Selecione um nível'}
          </MenuItem>
          {!inlineDegreeOptions.some(
            (option) => String(option.level) === draft[group],
          ) &&
            draft[group] !== '' && (
              <MenuItem value={String(draft[group])} disabled>
                Valor atual ({String(draft[group])})
              </MenuItem>
            )}
          {inlineDegreeOptions.map((option) => (
            <MenuItem key={option.level} value={String(option.level)}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
      <Button size="small" disabled={pending} onClick={() => void onSave()}>
        Salvar
      </Button>
      <Button
        size="small"
        disabled={pending}
        onClick={() => {
          onCancel();
        }}
      >
        Cancelar
      </Button>
    </Box>
  );
}
