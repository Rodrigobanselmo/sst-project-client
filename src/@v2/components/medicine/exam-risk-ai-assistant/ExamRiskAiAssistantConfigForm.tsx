import { FC } from 'react';

import {
  Box,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import {
  EXAM_RISK_AI_DEFAULT_LIMIT,
  EXAM_RISK_AI_EXAM_TYPE_OPTIONS,
  EXAM_RISK_AI_MAX_LIMIT,
} from './exam-risk-ai-assistant.constants';
import type {
  ExamRiskAiAssistantFormValues,
  ExamRiskAiAssistantOptionSwitch,
} from './exam-risk-ai-assistant.types';

type Props = {
  values: ExamRiskAiAssistantFormValues;
  onFieldChange: <K extends keyof ExamRiskAiAssistantFormValues>(
    key: K,
    value: ExamRiskAiAssistantFormValues[K],
  ) => void;
  optionSwitches?: ExamRiskAiAssistantOptionSwitch[];
};

export const ExamRiskAiAssistantConfigForm: FC<Props> = ({
  values,
  onFieldChange,
  optionSwitches = [],
}) => (
  <Stack spacing={3}>
    <Stack spacing={2}>
      <Typography variant="subtitle1">Filtros de exames</Typography>
      <Box display="flex" gap={2} flexWrap="wrap">
        <TextField
          label="Buscar exame"
          value={values.examSearch}
          onChange={(event) => onFieldChange('examSearch', event.target.value)}
          size="small"
          sx={{ minWidth: 280, flex: 1 }}
        />
        <TextField
          select
          label="Tipo de exame"
          value={values.examType}
          onChange={(event) => onFieldChange('examType', event.target.value)}
          size="small"
          sx={{ minWidth: 180 }}
        >
          {EXAM_RISK_AI_EXAM_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value || 'ALL'} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Limite de exames candidatos"
          type="number"
          value={values.limit}
          onChange={(event) =>
            onFieldChange(
              'limit',
              Math.min(
                EXAM_RISK_AI_MAX_LIMIT,
                Math.max(1, Number(event.target.value) || EXAM_RISK_AI_DEFAULT_LIMIT),
              ),
            )
          }
          size="small"
          sx={{ width: 180 }}
          helperText={`Padrão ${EXAM_RISK_AI_DEFAULT_LIMIT}, máximo ${EXAM_RISK_AI_MAX_LIMIT}`}
        />
      </Box>
      <Box display="flex" gap={2} flexWrap="wrap">
        <FormControlLabel
          control={
            <Switch
              checked={values.onlyESocial}
              onChange={(event) =>
                onFieldChange('onlyESocial', event.target.checked)
              }
            />
          }
          label="Somente exames com eSocial"
        />
        {optionSwitches.map((option) => (
          <FormControlLabel
            key={option.key}
            control={
              <Switch
                checked={option.checked}
                onChange={(event) => option.onChange(event.target.checked)}
              />
            }
            label={option.label}
          />
        ))}
      </Box>
    </Stack>

    <Stack spacing={2}>
      <Typography variant="subtitle1">Prompt e instruções</Typography>
      <TextField
        label="Instruções"
        value={values.instructions}
        onChange={(event) => onFieldChange('instructions', event.target.value)}
        multiline
        minRows={2}
        fullWidth
        placeholder="Orientações gerais para a análise do risco e dos exames candidatos"
      />
      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
        gap={2}
      >
        <TextField
          label="Exemplos positivos"
          value={values.positiveExamples}
          onChange={(event) =>
            onFieldChange('positiveExamples', event.target.value)
          }
          multiline
          minRows={2}
          placeholder="Exames que costumam fazer sentido para riscos semelhantes"
        />
        <TextField
          label="Exemplos negativos"
          value={values.negativeExamples}
          onChange={(event) =>
            onFieldChange('negativeExamples', event.target.value)
          }
          multiline
          minRows={2}
          placeholder="Exames que não devem ser sugeridos para este contexto"
        />
        <TextField
          label="Cautelas / considerações"
          value={values.cautionRules}
          onChange={(event) => onFieldChange('cautionRules', event.target.value)}
          multiline
          minRows={2}
          placeholder="Restrições clínicas, normativas ou de contexto ocupacional"
        />
        <TextField
          label="Instrução adicional da sessão"
          value={values.sessionInstruction}
          onChange={(event) =>
            onFieldChange('sessionInstruction', event.target.value)
          }
          multiline
          minRows={2}
          placeholder="Ajuste pontual para esta execução da IA"
        />
      </Box>
      <TextField
        label="Modelo IA opcional"
        value={values.model}
        onChange={(event) => onFieldChange('model', event.target.value)}
        size="small"
        sx={{ maxWidth: 360 }}
      />
    </Stack>
  </Stack>
);
