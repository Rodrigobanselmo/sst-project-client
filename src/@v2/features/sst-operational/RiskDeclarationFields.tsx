import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { messageOf } from './api';
import {
  readRiskDeclaration,
  riskDeclarationError,
  riskDeclarationJson,
  type RiskDeclarationDraft,
} from './risk-declaration-model';

export function RiskDeclarationFields({
  json,
  onSave,
  disabled,
  epiCount = 0,
  epcCount = 0,
}: {
  json: unknown;
  onSave: (json: Record<string, unknown>) => Promise<void>;
  disabled?: boolean;
  epiCount?: number;
  epcCount?: number;
}) {
  const sourceKey = JSON.stringify(json || {});
  const [baseKey, setBaseKey] = useState(sourceKey);
  const [draft, setDraft] = useState(() => readRiskDeclaration(json));
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [saved, setSaved] = useState(false);
  const dirty =
    JSON.stringify(draft) !==
    JSON.stringify(readRiskDeclaration(JSON.parse(baseKey)));
  const conflict = sourceKey !== baseKey && dirty && !saved;
  useEffect(() => {
    if (sourceKey === baseKey || busy || (dirty && !saved)) return;
    setDraft(readRiskDeclaration(JSON.parse(sourceKey)));
    setBaseKey(sourceKey);
  }, [sourceKey, baseKey, busy, dirty, saved]);
  const change = (field: keyof RiskDeclarationDraft, value: string) => {
    setDraft((prior) => ({ ...prior, [field]: value }));
    setSaved(false);
    setError('');
  };
  const save = async () => {
    const invalid = riskDeclarationError(draft, epiCount, epcCount);
    if (invalid) return setError(invalid);
    setBusy(true);
    setError('');
    try {
      await onSave(riskDeclarationJson(JSON.parse(baseKey), draft));
      setSaved(true);
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };
  const select = (
    field: keyof RiskDeclarationDraft,
    label: string,
    options: [string, string][],
    helperText?: string,
  ) => (
    <TextField
      select
      fullWidth
      label={label}
      value={draft[field]}
      onChange={(e) => change(field, e.target.value)}
      disabled={busy || disabled}
      helperText={helperText}
    >
      {options.map(([value, title]) => (
        <MenuItem key={value} value={value}>
          {title}
        </MenuItem>
      ))}
    </TextField>
  );
  const controls: [string, string][] = [
    ['NOT_INFORMED', 'Não informado'],
    ['YES', 'Sim'],
    ['NO', 'Não'],
    ['NOT_APPLICABLE', 'Não se aplica'],
  ];
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{ border: 1, borderColor: 'divider', mt: 4 }}
      TransitionProps={{ unmountOnExit: true }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body2">Condições para o eSocial</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 8 }}>
        <Stack spacing={8} useFlexGap>
          <Typography variant="body2">
            Informações desta avaliação. Salvar atualiza o próprio cadastro; a
            transmissão é confirmada no painel do eSocial. As respostas
            individuais dos EPIs continuam no cadastro de cada equipamento.
          </Typography>
          {select(
            'exposure',
            'Exposição ao agente',
            [
              ['NOT_INFORMED', 'Não informado'],
              ['PRESENT', 'Presente'],
              ['ABSENT', 'Ausente'],
            ],
            'Uma probabilidade baixa, sozinha, não comprova a eliminação da exposição.',
          )}
          {select('scope', 'Enquadramento para o eSocial', [
            ['', 'Conforme o enquadramento cadastrado'],
            ['IN_SCOPE', 'Enquadrado'],
            ['OUT_OF_SCOPE', 'Não enquadrado'],
          ])}
          {select(
            'assessmentType',
            'Tipo de avaliação para o eSocial',
            [
              ['', 'Conforme a avaliação cadastrada'],
              ['QUALITATIVE', 'Qualitativa'],
              ['QUANTITATIVE', 'Quantitativa'],
              ['NOT_INFORMED', 'Não informado'],
            ],
            'Uma avaliação quantitativa exige medição completa. Avaliações qualitativas não exigem cadastrar uma medição.',
          )}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={8} useFlexGap>
            {select('epiUsed', 'Utiliza EPI nesta avaliação?', controls)}
            {select('epcPresent', 'Existe EPC nesta avaliação?', controls)}
          </Stack>
          <TextField
            label="Justificativa da ausência ou não enquadramento"
            value={draft.justification}
            onChange={(e) => change('justification', e.target.value)}
            multiline
            minRows={2}
            disabled={busy || disabled}
            required={
              draft.exposure === 'ABSENT' || draft.scope === 'OUT_OF_SCOPE'
            }
            inputProps={{ maxLength: 10000 }}
          />
          <TextField
            label="Descrição do agente para o eSocial"
            value={draft.agentDescription}
            onChange={(e) => change('agentDescription', e.target.value)}
            disabled={busy || disabled}
            inputProps={{ maxLength: 100 }}
            helperText="Opcional quando o enquadramento não exige uma descrição específica. Até 100 caracteres."
          />
          <TextField
            label="Observações para o eSocial"
            value={draft.notes}
            onChange={(e) => change('notes', e.target.value)}
            multiline
            disabled={busy || disabled}
            inputProps={{ maxLength: 999 }}
          />
          <TextField
            label="Processo judicial relacionado"
            value={draft.judicialProcess}
            onChange={(e) => change('judicialProcess', e.target.value)}
            disabled={busy || disabled}
            inputProps={{ maxLength: 21, inputMode: 'numeric' }}
            helperText="Opcional. Informe os 17, 20 ou 21 dígitos do processo aplicável a esta declaração."
          />
          {conflict && (
            <Alert severity="warning">
              O cadastro foi alterado enquanto você preenchia estes campos.
              Recarregue os dados antes de salvar.{' '}
              <Button
                onClick={() => {
                  setDraft(readRiskDeclaration(json));
                  setBaseKey(sourceKey);
                  setSaved(false);
                  setError('');
                }}
              >
                Recarregar dados da avaliação
              </Button>
            </Alert>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {saved && (
            <Alert severity="success">
              Condições salvas na avaliação. Confira as pendências no painel do
              eSocial.
            </Alert>
          )}
          {!disabled && (
            <Button
              variant="outlined"
              onClick={save}
              disabled={busy || conflict || !dirty}
            >
              Salvar condições da avaliação
            </Button>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
