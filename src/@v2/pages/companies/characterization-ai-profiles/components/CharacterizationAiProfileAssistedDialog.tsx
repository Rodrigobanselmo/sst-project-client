import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import {
  CharacterizationAiProfileDraftCreationModeEnum,
  type CharacterizationAiProfileDraftDto,
  type CharacterizationAiProfileDto,
} from '@v2/services/security/characterization/characterization-ai-profile/service/characterization-ai-profile.types';
import { useMutateCharacterizationAiProfile } from '@v2/services/security/characterization/characterization-ai-profile/hooks/useMutateCharacterizationAiProfile';
import { characterizationMap } from 'core/constants/maps/characterization.map';
import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';
import { useMemo, useState } from 'react';

import { CHARACTERIZATION_AI_SPECIALIST_CATEGORIES } from '../constants/characterization-ai-specialist-category.constants';
import { CharacterizationAiProfileAudioRecorder } from './CharacterizationAiProfileAudioRecorder';
import {
  CharacterizationAiProfileFormDialog,
  type CharacterizationAiProfileFormValues,
} from './CharacterizationAiProfileFormDialog';

const ALL_TYPES = Object.values(CharacterizationTypeEnum);
const STEPS = ['Objetivo', 'Contexto', 'Base', 'Revisão'];

const CREATION_MODE_OPTIONS: {
  value: CharacterizationAiProfileDraftCreationModeEnum;
  title: string;
  description: string;
}[] = [
  {
    value: CharacterizationAiProfileDraftCreationModeEnum.FROM_SCRATCH,
    title: 'Criar do zero',
    description:
      'A IA monta o especialista apenas com o objetivo e o contexto informados, sem herdar regras de outra base.',
  },
  {
    value: CharacterizationAiProfileDraftCreationModeEnum.SYSTEM_BASE,
    title: 'Partir da base neutra do sistema',
    description:
      'Usa a base neutra do sistema como ponto de partida e adapta o conteúdo ao objetivo e ao contexto descritos.',
  },
  {
    value: CharacterizationAiProfileDraftCreationModeEnum.ADAPT_REFERENCE,
    title: 'Adaptar especialista existente',
    description:
      'Parte de um especialista ativo da empresa e ajusta nome, blocos e regras conforme o novo objetivo.',
  },
];

function ChangeSummaryList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <Box>
      <Typography variant="subtitle2">{title}</Typography>
      <List dense disablePadding>
        {items.map((item) => (
          <ListItem key={item} disableGutters>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

function DraftField({
  label,
  value,
  minRows = 2,
}: {
  label: string;
  value: string;
  minRows?: number;
}) {
  return (
    <TextField
      label={label}
      fullWidth
      multiline
      minRows={minRows}
      value={value}
      InputProps={{ readOnly: true }}
    />
  );
}

type Props = {
  open: boolean;
  companyId: string;
  activeProfiles: CharacterizationAiProfileDto[];
  onClose: () => void;
  onSaved?: () => void;
};

export function CharacterizationAiProfileAssistedDialog({
  open,
  companyId,
  activeProfiles,
  onClose,
  onSaved,
}: Props) {
  const { generateDraft } = useMutateCharacterizationAiProfile();
  const [step, setStep] = useState(0);
  const [suggestedName, setSuggestedName] = useState('');
  const [category, setCategory] = useState('');
  const [objective, setObjective] = useState('');
  const [recommendedTypes, setRecommendedTypes] = useState<
    CharacterizationTypeEnum[]
  >([]);
  const [sourceInstructions, setSourceInstructions] = useState('');
  const [creationMode, setCreationMode] =
    useState<CharacterizationAiProfileDraftCreationModeEnum>(
      CharacterizationAiProfileDraftCreationModeEnum.SYSTEM_BASE,
    );
  const [referenceProfileId, setReferenceProfileId] = useState('');
  const [draft, setDraft] = useState<CharacterizationAiProfileDraftDto | null>(
    null,
  );
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const draftInitialValues = useMemo<
    Partial<CharacterizationAiProfileFormValues> | undefined
  >(() => {
    if (!draft) return undefined;
    return {
      name: draft.name,
      category: draft.category ?? '',
      objective: draft.objective,
      description: draft.description ?? '',
      usageGuidance: draft.usageGuidance ?? '',
      instructions: draft.instructions,
      fieldInstructions: draft.fieldInstructions,
      recommendedCharacterizationTypes: draft.recommendedCharacterizationTypes,
    };
  }, [draft]);

  const reset = () => {
    setStep(0);
    setSuggestedName('');
    setCategory('');
    setObjective('');
    setRecommendedTypes([]);
    setSourceInstructions('');
    setCreationMode(
      CharacterizationAiProfileDraftCreationModeEnum.SYSTEM_BASE,
    );
    setReferenceProfileId('');
    setDraft(null);
    setSaveDialogOpen(false);
    setGenerateError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGenerateDraft = async () => {
    setGenerateError(null);
    try {
      const result = await generateDraft.mutateAsync({
        companyId,
        creationMode,
        sourceInstructions: sourceInstructions.trim() || undefined,
        referenceProfileId:
          creationMode ===
          CharacterizationAiProfileDraftCreationModeEnum.ADAPT_REFERENCE
            ? referenceProfileId || undefined
            : undefined,
        suggestedName: suggestedName.trim() || undefined,
        objective: objective.trim() || undefined,
        category: category.trim() || undefined,
        recommendedCharacterizationTypes: recommendedTypes.length
          ? recommendedTypes
          : undefined,
      });
      setDraft(result);
      setStep(3);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string | string[] } } })
          ?.response?.data?.message ?? 'Não foi possível gerar o rascunho.';
      setGenerateError(
        Array.isArray(message) ? message.join(' ') : String(message),
      );
    }
  };

  const needsReference =
    creationMode ===
    CharacterizationAiProfileDraftCreationModeEnum.ADAPT_REFERENCE;

  const canAdvanceFromObjective =
    suggestedName.trim().length > 0 && objective.trim().length > 0;

  const canAdvanceFromContext = sourceInstructions.trim().length > 0;

  const canGenerateDraft =
    !generateDraft.isPending && (!needsReference || Boolean(referenceProfileId));

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Criar especialista com assistência</DialogTitle>
        <DialogContent>
          <Stepper activeStep={step} sx={{ mb: 3, mt: 1 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {step === 0 ? (
            <Stack spacing={2}>
              <TextField
                label="Nome do especialista"
                required
                fullWidth
                value={suggestedName}
                onChange={(e) => setSuggestedName(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel id="assisted-category-label">Categoria</InputLabel>
                <Select
                  labelId="assisted-category-label"
                  label="Categoria"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Nenhuma</em>
                  </MenuItem>
                  {CHARACTERIZATION_AI_SPECIALIST_CATEGORIES.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Objetivo técnico"
                required
                fullWidth
                multiline
                minRows={3}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                helperText="Descreva o que este especialista deve alcançar na caracterização."
              />
              <FormControl fullWidth>
                <InputLabel id="assisted-types-label">
                  Tipos recomendados
                </InputLabel>
                <Select
                  labelId="assisted-types-label"
                  label="Tipos recomendados"
                  multiple
                  value={recommendedTypes}
                  onChange={(e) =>
                    setRecommendedTypes(
                      e.target.value as CharacterizationTypeEnum[],
                    )
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
            </Stack>
          ) : null}

          {step === 1 ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Descreva como este especialista deve trabalhar.
              </Typography>
              <TextField
                label="Contexto operacional"
                multiline
                minRows={4}
                fullWidth
                value={sourceInstructions}
                onChange={(e) => setSourceInstructions(e.target.value)}
                helperText="Inclua terminologia, limites, exemplos e critérios de qualidade esperados."
              />
              <CharacterizationAiProfileAudioRecorder
                companyId={companyId}
                onApplyTranscription={(text) => {
                  setSourceInstructions((prev) =>
                    prev.trim() ? `${prev.trim()}\n\n${text}` : text,
                  );
                }}
              />
              <Alert severity="info">
                A IA organizará o conteúdo nos blocos nesta ordem: Descrição,
                Processos e atividades, Orientações para interpretação das
                fotografias e Considerações.
              </Alert>
            </Stack>
          ) : null}

          {step === 2 ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Escolha a base de partida para gerar o rascunho do especialista.
              </Typography>
              <RadioGroup
                value={creationMode}
                onChange={(e) =>
                  setCreationMode(
                    e.target
                      .value as CharacterizationAiProfileDraftCreationModeEnum,
                  )
                }
              >
                {CREATION_MODE_OPTIONS.map((option) => (
                  <Paper
                    key={option.value}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 1,
                      borderColor:
                        creationMode === option.value
                          ? 'primary.main'
                          : 'divider',
                    }}
                  >
                    <FormControlLabel
                      value={option.value}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="subtitle2">
                            {option.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', m: 0 }}
                    />
                  </Paper>
                ))}
              </RadioGroup>

              {needsReference ? (
                <FormControl fullWidth required>
                  <InputLabel id="reference-profile-label">
                    Especialista de referência
                  </InputLabel>
                  <Select
                    labelId="reference-profile-label"
                    label="Especialista de referência"
                    value={referenceProfileId}
                    onChange={(e) => setReferenceProfileId(e.target.value)}
                  >
                    {activeProfiles.map((profile) => (
                      <MenuItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null}

              {generateError ? (
                <Alert severity="error">{generateError}</Alert>
              ) : null}
            </Stack>
          ) : null}

          {step === 3 && draft ? (
            <Stack spacing={2}>
              <Alert severity="info">
                Este é um rascunho gerado por IA. Revise antes de salvar — nada
                é persistido automaticamente.
              </Alert>
              <DraftField label="Nome do especialista" value={draft.name} />
              <DraftField
                label="Categoria"
                value={draft.category ?? '—'}
                minRows={1}
              />
              <DraftField label="Objetivo técnico" value={draft.objective} />
              <DraftField
                label="Descrição"
                value={draft.description ?? ''}
              />
              <DraftField
                label="Quando utilizar"
                value={draft.usageGuidance ?? ''}
              />
              <Typography variant="body2" color="text.secondary">
                Tipos recomendados:{' '}
                {(draft.recommendedCharacterizationTypes || [])
                  .map((t) => characterizationMap[t]?.name ?? t)
                  .join(', ') || '—'}
              </Typography>

              <Typography variant="subtitle2" sx={{ pt: 1 }}>
                Orientações por bloco
              </Typography>
              <DraftField
                label="Descrição"
                value={draft.fieldInstructions.description}
              />
              <DraftField
                label="Processos e atividades"
                value={draft.fieldInstructions.workActivities}
              />
              <DraftField
                label="Orientações para interpretação das fotografias"
                value={draft.fieldInstructions.photos}
              />
              <DraftField
                label="Considerações"
                value={draft.fieldInstructions.considerations}
              />
              <DraftField
                label="Regras gerais"
                value={draft.instructions}
                minRows={6}
              />

              <ChangeSummaryList
                title="Preservado"
                items={draft.changeSummary.preserved}
              />
              <ChangeSummaryList
                title="Removido"
                items={draft.changeSummary.removed}
              />
              <ChangeSummaryList
                title="Acrescentado"
                items={draft.changeSummary.added}
              />
              <ChangeSummaryList
                title="Avisos"
                items={draft.changeSummary.warnings}
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          {step > 0 && step < 3 ? (
            <Button
              onClick={() => setStep((s) => s - 1)}
              disabled={generateDraft.isPending}
            >
              Voltar
            </Button>
          ) : null}
          {step === 0 ? (
            <Button
              variant="contained"
              disabled={!canAdvanceFromObjective}
              onClick={() => setStep(1)}
            >
              Próximo
            </Button>
          ) : null}
          {step === 1 ? (
            <Button
              variant="contained"
              disabled={!canAdvanceFromContext}
              onClick={() => setStep(2)}
            >
              Próximo
            </Button>
          ) : null}
          {step === 2 ? (
            <Button
              variant="contained"
              disabled={!canGenerateDraft}
              onClick={() => void handleGenerateDraft()}
            >
              {generateDraft.isPending ? 'Gerando…' : 'Gerar rascunho'}
            </Button>
          ) : null}
          {step === 3 && draft ? (
            <Button variant="contained" onClick={() => setSaveDialogOpen(true)}>
              Salvar especialista
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>

      <CharacterizationAiProfileFormDialog
        open={saveDialogOpen}
        companyId={companyId}
        initialValues={draftInitialValues}
        createSourceKind="ASSISTED_DRAFT"
        onClose={() => setSaveDialogOpen(false)}
        onSaved={() => {
          onSaved?.();
          handleClose();
        }}
      />
    </>
  );
}
