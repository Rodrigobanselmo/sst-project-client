import React, { FC, useEffect, useMemo, useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useSnackbar } from 'notistack';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import type { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';
import {
  AI_MODEL_OPTIONS,
  type AiModelOption,
} from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/ai-model-options';
import { CharacterizationAiProfileFormDialog } from '@v2/pages/companies/characterization-ai-profiles/components/CharacterizationAiProfileFormDialog';
import { useFetchSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useFetchSystemAiPrompt';
import { useMutateUpsertSystemAiPrompt } from '@v2/services/forms/system-ai-prompt/hooks/useMutateUpsertSystemAiPrompt';
import { getSystemAiPromptErrorMessage } from '@v2/services/forms/system-ai-prompt/utils/system-ai-prompt-error.utils';
import type { CharacterizationAiProfileDto } from '@v2/services/security/characterization/characterization-ai-profile/service/characterization-ai-profile.types';
import type {
  AiCharacterizationAssistCompanyRole,
  AiCharacterizationAssistOutputIntent,
  AiCharacterizationAssistQuestionnaire,
  AiCharacterizationAssistScope,
  AiCharacterizationAssistTarget,
  AiTemporaryDocumentSource,
} from '@v2/services/security/characterization/characterization/ai-characterization-assist/service/ai-characterization-assist.types';

import {
  buildCharacterizationAiAssistArchitecturePreview,
  resolveSpecialistPromptCopyPayload,
} from './build-characterization-ai-assist-architecture-preview.util';
import {
  CHARACTERIZATION_AI_ASSIST_NEUTRAL_MOTOR_PROPOSAL,
  CHARACTERIZATION_AI_ASSIST_NEUTRAL_MOTOR_PROPOSAL_AVAILABLE,
} from './characterization-ai-assist-neutral-motor-proposal.constant';
import {
  splitMotorGuardrailIssues,
  validateCharacterizationAiAssistMotorContent,
} from './validate-characterization-ai-assist-motor-content.util';

type ArchitectureForm = {
  customPrompt?: string;
  model?: AiModelOption;
};

export type CharacterizationAiAssistArchitectureDialogProps = {
  open: boolean;
  onClose: () => void;
  onApply: (config: SystemAiMasterConfig) => void;
  onDiscardTemporary?: () => void;
  initialConfig?: SystemAiMasterConfig;
  factoryDefaultPrompt: string;
  companyId: string;
  specialist: CharacterizationAiProfileDto | null;
  questionnaire: AiCharacterizationAssistQuestionnaire;
  userObservations: string;
  userProvidedSources: string;
  enableWebSearch: boolean;
  temporaryDocumentSource: AiTemporaryDocumentSource | null;
  characterization: {
    name?: string | null;
    type?: string | null;
    paragraphs?: string[] | null;
    activities?: string[] | null;
    considerations?: string[] | null;
    photos?: unknown[] | null;
    temperature?: string | null;
    noiseValue?: string | null;
    luminosity?: string | null;
    moisturePercentage?: string | null;
  };
  labels: {
    scope: Record<AiCharacterizationAssistScope, string>;
    companyRole: Record<AiCharacterizationAssistCompanyRole, string>;
    target: Record<AiCharacterizationAssistTarget, string>;
    outputIntent: Record<AiCharacterizationAssistOutputIntent, string>;
  };
  onSpecialistSaved?: () => void;
};

const DEFAULT_MODEL =
  AI_MODEL_OPTIONS.find((option) => option.value === 'gpt-4o-mini') ??
  AI_MODEL_OPTIONS[0];

const MOTOR_KEY = SystemAiPromptKeyEnum.CHARACTERIZATION_AI_ASSIST;

const LayerArrow: FC = () => (
  <Typography
    variant="caption"
    color="text.secondary"
    sx={{ display: 'block', textAlign: 'center', my: 0.5, fontWeight: 700 }}
  >
    ↓
  </Typography>
);

const LayerCard: FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: 'primary' | 'default';
}> = ({ title, subtitle, children, accent = 'default' }) => (
  <Box
    sx={{
      border: '1px solid',
      borderColor: accent === 'primary' ? 'primary.light' : 'grey.300',
      borderRadius: 1.5,
      p: 2,
      bgcolor: accent === 'primary' ? 'primary.50' : 'background.paper',
    }}
  >
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: 700, mb: subtitle ? 0.25 : 1 }}
    >
      {title}
    </Typography>
    {subtitle ? (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 1.5 }}
      >
        {subtitle}
      </Typography>
    ) : null}
    {children}
  </Box>
);

function formatUpdatedAt(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return '—';
  return date.toLocaleString('pt-BR');
}

function buildDiffSummary(previous: string, next: string) {
  const prevLen = previous.trim().length;
  const nextLen = next.trim().length;
  const delta = nextLen - prevLen;
  const sign = delta > 0 ? '+' : '';
  return `Tamanho anterior: ${prevLen} caracteres → novo: ${nextLen} (${sign}${delta}).`;
}

export const CharacterizationAiAssistArchitectureDialog: FC<
  CharacterizationAiAssistArchitectureDialogProps
> = ({
  open,
  onClose,
  onApply,
  onDiscardTemporary,
  initialConfig,
  factoryDefaultPrompt,
  companyId,
  specialist,
  questionnaire,
  userObservations,
  userProvidedSources,
  enableWebSearch,
  temporaryDocumentSource,
  characterization,
  labels,
  onSpecialistSaved,
}) => {
  const { showConfirmation } = useConfirmationModal();
  const { enqueueSnackbar } = useSnackbar();
  const [editSpecialistOpen, setEditSpecialistOpen] = useState(false);
  const [specialistPromptOpen, setSpecialistPromptOpen] = useState(false);
  const [effectiveExpanded, setEffectiveExpanded] = useState(true);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [revisionMode, setRevisionMode] = useState<'save' | 'restore-fallback'>(
    'save',
  );

  const methods = useForm<ArchitectureForm>({
    defaultValues: {
      customPrompt: factoryDefaultPrompt,
      model: DEFAULT_MODEL,
    },
  });
  const { reset, getValues, setValue, control } = methods;
  const watchedPrompt = useWatch({ control, name: 'customPrompt' });

  const {
    data: systemAiPrompt,
    isLoading: isLoadingSystemAiPrompt,
    isError: isSystemAiPromptError,
    error: systemAiPromptError,
    refetch: refetchSystemAiPrompt,
  } = useFetchSystemAiPrompt(MOTOR_KEY, open);

  const { mutateAsync: upsertSystemAiPromptAsync, isPending: isSavingRevision } =
    useMutateUpsertSystemAiPrompt();

  const factoryDefaultContent = useMemo(
    () => systemAiPrompt?.defaultContent?.trim() || factoryDefaultPrompt,
    [factoryDefaultPrompt, systemAiPrompt?.defaultContent],
  );

  const globalActiveContent = useMemo(() => {
    if (systemAiPrompt?.isPersistedDefault) {
      return systemAiPrompt.content?.trim() || factoryDefaultContent;
    }
    return factoryDefaultContent;
  }, [factoryDefaultContent, systemAiPrompt]);

  const sessionPrompt = initialConfig?.customPrompt?.trim() || '';
  const hasTemporarySession = Boolean(sessionPrompt);

  const activeSource: 'temporary' | 'global' | 'fallback' = hasTemporarySession
    ? 'temporary'
    : systemAiPrompt?.isPersistedDefault
      ? 'global'
      : 'fallback';

  const activeSourceLabel =
    activeSource === 'temporary'
      ? 'Temporário nesta execução'
      : activeSource === 'global'
        ? 'Padrão global'
        : 'Fallback do sistema';

  const editorContent = (watchedPrompt || '').trim();
  const baselineForEditor = hasTemporarySession
    ? sessionPrompt
    : globalActiveContent;
  const isEditorDirty = editorContent !== baselineForEditor.trim();
  const isMaterialChangeVsGlobal =
    editorContent !== globalActiveContent.trim() && Boolean(editorContent);

  const resolveModelOption = (modelValue?: string): AiModelOption => {
    if (!modelValue) return getValues('model') ?? DEFAULT_MODEL;
    return (
      AI_MODEL_OPTIONS.find((option) => option.value === modelValue) ??
      getValues('model') ??
      DEFAULT_MODEL
    );
  };

  useEffect(() => {
    if (!open) return;

    const sessionModel = resolveModelOption(initialConfig?.model);

    if (sessionPrompt || initialConfig?.model) {
      reset({
        customPrompt:
          sessionPrompt ||
          systemAiPrompt?.content ||
          factoryDefaultContent ||
          '',
        model: sessionModel,
      });
      return;
    }

    if (systemAiPrompt) {
      reset({
        customPrompt: systemAiPrompt.content || factoryDefaultContent,
        model: getValues('model') ?? DEFAULT_MODEL,
      });
      return;
    }

    if (!isLoadingSystemAiPrompt) {
      reset({
        customPrompt: factoryDefaultContent,
        model: getValues('model') ?? DEFAULT_MODEL,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    factoryDefaultContent,
    initialConfig?.customPrompt,
    initialConfig?.model,
    isLoadingSystemAiPrompt,
    open,
    reset,
    systemAiPrompt,
  ]);

  const preview = useMemo(
    () =>
      buildCharacterizationAiAssistArchitecturePreview({
        motorPrompt: watchedPrompt || '',
        specialist,
        questionnaire,
        userObservations,
        userProvidedSources,
        enableWebSearch,
        temporaryDocumentSource,
        characterization,
        labels,
      }),
    [
      watchedPrompt,
      specialist,
      questionnaire,
      userObservations,
      userProvidedSources,
      enableWebSearch,
      temporaryDocumentSource,
      characterization,
      labels,
    ],
  );

  const handleApplyTemporaryOnly = () => {
    const content = getValues('customPrompt')?.trim();
    if (!content) {
      enqueueSnackbar('O motor não pode estar vazio para aplicar na execução.', {
        variant: 'warning',
      });
      return;
    }

    onApply({
      customPrompt: content,
      model: getValues('model')?.value,
    });
    enqueueSnackbar(
      'Alteração temporária aplicada somente nesta execução. O motor padrão global não foi modificado.',
      { variant: 'success' },
    );
  };

  const handleDiscardTemporary = () => {
    onDiscardTemporary?.();
    setValue('customPrompt', globalActiveContent);
    enqueueSnackbar('Alterações temporárias descartadas. Voltando ao motor global ativo.', {
      variant: 'info',
    });
  };

  const handleCopySpecialistPrompt = async () => {
    const text = resolveSpecialistPromptCopyPayload(preview.specialistAppendix);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      enqueueSnackbar('Prompt completo do especialista copiado.', {
        variant: 'success',
      });
    } catch {
      enqueueSnackbar('Não foi possível copiar o texto.', { variant: 'error' });
    }
  };

  const handleLoadNeutralProposal = () => {
    if (!CHARACTERIZATION_AI_ASSIST_NEUTRAL_MOTOR_PROPOSAL_AVAILABLE) {
      enqueueSnackbar(
        'Proposta de motor neutro ainda não está embutida neste WIP. Cole o texto fornecido por Alex no editor e salve conscientemente como nova revisão.',
        { variant: 'warning' },
      );
      return;
    }
    setValue(
      'customPrompt',
      CHARACTERIZATION_AI_ASSIST_NEUTRAL_MOTOR_PROPOSAL.trim(),
    );
    enqueueSnackbar(
      'Proposta neutra carregada apenas no editor (não publicada). Revise e salve como nova revisão se desejar.',
      { variant: 'info' },
    );
  };

  const openSaveRevisionDialog = () => {
    const content = getValues('customPrompt')?.trim() || '';
    const { blocking } = splitMotorGuardrailIssues(
      validateCharacterizationAiAssistMotorContent(content),
    );
    if (blocking.length) {
      enqueueSnackbar(blocking.map((issue) => issue.message).join(' '), {
        variant: 'warning',
      });
      return;
    }
    if (!isMaterialChangeVsGlobal) {
      enqueueSnackbar('Não há mudança material em relação ao motor global ativo.', {
        variant: 'info',
      });
      return;
    }
    setRevisionMode('save');
    setRevisionReason('');
    setRevisionDialogOpen(true);
  };

  const openRestoreFallbackDialog = () => {
    setRevisionMode('restore-fallback');
    setRevisionReason('');
    setRevisionDialogOpen(true);
  };

  const handleConfirmRevision = async () => {
    const reason = revisionReason.trim();
    if (reason.length < 3) {
      enqueueSnackbar('Informe o motivo da alteração (obrigatório).', {
        variant: 'warning',
      });
      return;
    }

    const content =
      revisionMode === 'restore-fallback'
        ? factoryDefaultContent.trim()
        : getValues('customPrompt')?.trim() || '';

    const issues = validateCharacterizationAiAssistMotorContent(content);
    const { blocking, warnings } = splitMotorGuardrailIssues(issues);
    if (blocking.length) {
      enqueueSnackbar(blocking.map((issue) => issue.message).join(' '), {
        variant: 'warning',
      });
      return;
    }

    if (warnings.length) {
      const confirmedWarnings = await showConfirmation({
        title: 'Avisos estruturais do motor',
        message: `Alguns conceitos estruturais podem estar pouco explícitos:\n\n${warnings
          .map((issue) => `• ${issue.message}`)
          .join('\n')}\n\nDeseja salvar mesmo assim?`,
        confirmText: 'Salvar mesmo assim',
        cancelText: 'Revisar',
        variant: 'warning',
      });
      if (!confirmedWarnings) return;
    }

    try {
      const saved = await upsertSystemAiPromptAsync({
        key: MOTOR_KEY,
        content,
        changeReason: reason,
      });
      setRevisionDialogOpen(false);
      setRevisionReason('');
      onDiscardTemporary?.();
      setValue('customPrompt', saved.content);
      await refetchSystemAiPrompt();
      enqueueSnackbar(
        'Nova revisão global salva. Esta alteração passa a afetar todas as empresas e especialistas que utilizam este motor.',
        { variant: 'success' },
      );
    } catch {
      // Error snackbar already handled by mutation hook.
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const fetchErrorMessage = isSystemAiPromptError
    ? getSystemAiPromptErrorMessage(systemAiPromptError as Error)
    : null;

  const hasSessionAppliedConfig = Boolean(
    initialConfig?.customPrompt?.trim() || initialConfig?.model,
  );
  const isLoadingPrompt =
    isLoadingSystemAiPrompt && !hasSessionAppliedConfig;

  const canSaveRevision =
    !isLoadingPrompt &&
    !isSavingRevision &&
    isMaterialChangeVsGlobal &&
    Boolean(editorContent);

  const revisionConfirmContent =
    revisionMode === 'restore-fallback'
      ? factoryDefaultContent
      : editorContent;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        disableEscapeKeyDown={
          editSpecialistOpen || revisionDialogOpen || specialistPromptOpen
        }
      >
        <FormProvider {...methods}>
          <form onSubmit={handleFormSubmit}>
            <DialogTitle>
              Arquitetura do Assistente IA da Caracterização
            </DialogTitle>
            <DialogContent
              sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
            >
              <Alert severity="info">
                O Assistente monta o prompt em camadas. Digitar no editor não
                altera o padrão global. Use ações explícitas para ajuste
                temporário ou nova revisão.
              </Alert>

              {fetchErrorMessage && (
                <Alert severity="warning">{fetchErrorMessage}</Alert>
              )}

              <SSearchSelectForm
                name="model"
                label="Modelo de IA"
                placeholder="Selecione o modelo de IA"
                options={AI_MODEL_OPTIONS}
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
              />

              <LayerCard title="1. Motor base do sistema" accent="primary">
                <SFlex gap={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
                  <Chip
                    size="small"
                    color={
                      activeSource === 'temporary'
                        ? 'warning'
                        : activeSource === 'global'
                          ? 'success'
                          : 'default'
                    }
                    label={activeSourceLabel}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Key: ${MOTOR_KEY}`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={
                      systemAiPrompt?.isPersistedDefault
                        ? `Revisão ativa: ${systemAiPrompt.revision}`
                        : 'Revisão: fallback (sem persistência)'
                    }
                  />
                </SFlex>

                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Última alteração:{' '}
                  {systemAiPrompt?.isPersistedDefault
                    ? formatUpdatedAt(systemAiPrompt.updatedAt)
                    : '—'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.5 }}>
                  Responsável:{' '}
                  {systemAiPrompt?.isPersistedDefault && systemAiPrompt.updatedBy
                    ? `usuário #${systemAiPrompt.updatedBy}`
                    : '—'}
                </Typography>

                <Alert severity="info" sx={{ mb: 1.5 }}>
                  O motor contém as regras universais de segurança, fontes,
                  rastreabilidade, schema e estrutura documental. Especialistas
                  complementam o motor e não devem substituir essas regras.
                </Alert>

                {hasTemporarySession ? (
                  <Alert severity="warning" sx={{ mb: 1.5 }}>
                    Alteração temporária — não modifica o motor padrão do
                    sistema. Trace usará promptMode CUSTOM_SESSION.
                  </Alert>
                ) : null}

                {isEditorDirty ? (
                  <Alert severity="info" sx={{ mb: 1.5 }}>
                    Há alterações no editor ainda não aplicadas à execução nem
                    salvas como revisão global.
                  </Alert>
                ) : null}

                {isLoadingPrompt ? (
                  <Skeleton variant="rectangular" height={220} />
                ) : (
                  <SInputMultilineForm
                    name="customPrompt"
                    label="Editor do motor (cópia de trabalho)"
                    placeholder="Prompt base do Assistente..."
                    fullWidth
                    inputProps={{ minRows: 8, maxRows: 22 }}
                  />
                )}

                <SFlex gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    disabled={isLoadingPrompt || (!hasTemporarySession && !isEditorDirty)}
                    onClick={handleDiscardTemporary}
                  >
                    Descartar alterações temporárias
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    variant="contained"
                    disabled={isLoadingPrompt || !editorContent}
                    onClick={handleApplyTemporaryOnly}
                  >
                    Aplicar somente nesta execução
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    color="warning"
                    disabled={!canSaveRevision}
                    onClick={openSaveRevisionDialog}
                  >
                    Salvar como nova revisão do motor
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    disabled={isLoadingPrompt || isSavingRevision}
                    onClick={openRestoreFallbackDialog}
                  >
                    Restaurar fallback oficial
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    variant="text"
                    disabled={isLoadingPrompt}
                    onClick={handleLoadNeutralProposal}
                  >
                    Carregar proposta de motor neutro
                  </Button>
                </SFlex>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  Histórico navegável de revisões anteriores ainda não existe em
                  SystemAiPrompt (apenas revisão atual + fallback de código).
                </Typography>
              </LayerCard>

              <LayerArrow />

              <LayerCard
                title="2. Especialista de IA"
                subtitle="Complementa o motor para o contexto escolhido"
              >
                {specialist ? (
                  <Stack spacing={1}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {specialist.name}
                    </Typography>
                    <SFlex gap={1} flexWrap="wrap">
                      {specialist.category ? (
                        <Chip size="small" label={specialist.category} />
                      ) : null}
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Versão ${specialist.version}`}
                      />
                    </SFlex>
                    {specialist.objective ? (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Objetivo
                        </Typography>
                        <Typography variant="body2">
                          {specialist.objective}
                        </Typography>
                      </Box>
                    ) : null}
                    {specialist.description ? (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Resumo
                        </Typography>
                        <Typography variant="body2">
                          {specialist.description}
                        </Typography>
                      </Box>
                    ) : null}
                    <SFlex gap={1} flexWrap="wrap">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() => setSpecialistPromptOpen(true)}
                        disabled={!preview.specialistAppendix}
                      >
                        Ver prompt completo do especialista
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<OpenInNewIcon />}
                        onClick={() => setEditSpecialistOpen(true)}
                      >
                        Editar especialista
                      </Button>
                    </SFlex>
                  </Stack>
                ) : (
                  <Alert severity="warning">
                    Nenhum especialista selecionado. Esta execução usará somente
                    o motor base.
                  </Alert>
                )}
              </LayerCard>

              <LayerArrow />

              <LayerCard
                title="3. Questionário respondido"
                subtitle="Somente leitura — respostas desta execução"
              >
                <Stack spacing={0.75}>
                  {preview.questionnaireRows.map((row) => (
                    <Typography key={row.key} variant="body2">
                      <strong>{row.label}:</strong> ✓ {row.value}
                    </Typography>
                  ))}
                </Stack>
              </LayerCard>

              <LayerArrow />

              <LayerCard
                title="4. Contexto da caracterização e fontes"
                subtitle="Resumo do que participa desta execução"
              >
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Elemento:</strong>{' '}
                    {characterization.name || '(sem nome)'}
                    {characterization.type
                      ? ` (${characterization.type})`
                      : ''}
                  </Typography>
                  <Divider />
                  {preview.sourceStatuses.map((source) => (
                    <SFlex
                      key={source.key}
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Typography variant="body2">{source.label}</Typography>
                      <SFlex gap={1} alignItems="center">
                        <Chip
                          size="small"
                          color={source.used ? 'success' : 'default'}
                          label={source.used ? 'Utilizado' : 'Não utilizado'}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {source.detail}
                        </Typography>
                      </SFlex>
                    </SFlex>
                  ))}
                </Stack>
              </LayerCard>

              <LayerArrow />

              <Accordion
                expanded={effectiveExpanded}
                onChange={(_, expanded) => setEffectiveExpanded(expanded)}
                disableGutters
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.400',
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Prompt efetivo desta execução
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Prévia somente leitura: Motor + Especialista + Questionário
                      + Contexto + Fontes + Regras automáticas
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      maxHeight: 420,
                      overflow: 'auto',
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      fontSize: 12,
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    }}
                  >
                    {preview.effectivePromptPreview}
                  </Box>
                </AccordionDetails>
              </Accordion>
            </DialogContent>

            <DialogActions sx={{ px: 3 }}>
              <Button type="button" onClick={onClose}>
                Fechar
              </Button>
            </DialogActions>
          </form>
        </FormProvider>
      </Dialog>

      <Dialog
        open={revisionDialogOpen}
        onClose={() => setRevisionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {revisionMode === 'restore-fallback'
            ? 'Restaurar fallback oficial como nova revisão'
            : 'Salvar como nova revisão do motor'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Alert severity="warning">
            Impacto global: esta ação afeta todas as empresas e especialistas que
            utilizam o motor <strong>{MOTOR_KEY}</strong>.
          </Alert>
          <Typography variant="body2">
            Revisão atual:{' '}
            {systemAiPrompt?.isPersistedDefault
              ? systemAiPrompt.revision
              : 'fallback (sem persistência)'}
          </Typography>
          <Typography variant="body2">
            {buildDiffSummary(globalActiveContent, revisionConfirmContent)}
          </Typography>
          <TextField
            label="Motivo da alteração"
            required
            fullWidth
            multiline
            minRows={2}
            value={revisionReason}
            onChange={(e) => setRevisionReason(e.target.value)}
            helperText="Obrigatório. Registrado em log de auditoria (não há coluna de histórico ainda)."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevisionDialogOpen(false)}>Cancelar</Button>
          <SButton
            variant="contained"
            color="danger"
            text={
              revisionMode === 'restore-fallback'
                ? 'Publicar fallback como revisão'
                : 'Publicar nova revisão'
            }
            loading={isSavingRevision}
            disabled={revisionReason.trim().length < 3}
            buttonProps={{ type: 'button' }}
            onClick={() => void handleConfirmRevision()}
          />
        </DialogActions>
      </Dialog>

      <Dialog
        open={specialistPromptOpen}
        onClose={() => setSpecialistPromptOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          Prompt completo do especialista
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.75, fontWeight: 400 }}
          >
            Texto consolidado a partir dos campos do cadastro oficial e utilizado
            como camada complementar ao motor base.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Alert severity="info">
            Somente leitura. Para alterar estas instruções, edite o cadastro
            oficial do especialista.
          </Alert>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              maxHeight: 480,
              overflow: 'auto',
              bgcolor: 'grey.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200',
              fontSize: 12,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
          >
            {preview.specialistAppendix || '(especialista sem appendix)'}
          </Box>
          <Typography variant="caption" color="text.secondary">
            Para alterar este conteúdo, edite os campos do especialista. Esta
            visualização não modifica o cadastro nem a execução.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={() => void handleCopySpecialistPrompt()}
            disabled={!preview.specialistAppendix}
          >
            Copiar
          </Button>
          <SFlex gap={1}>
            <Button
              variant="outlined"
              startIcon={<OpenInNewIcon />}
              onClick={() => {
                setSpecialistPromptOpen(false);
                setEditSpecialistOpen(true);
              }}
            >
              Editar especialista
            </Button>
            <Button onClick={() => setSpecialistPromptOpen(false)}>Fechar</Button>
          </SFlex>
        </DialogActions>
      </Dialog>

      {specialist ? (
        <CharacterizationAiProfileFormDialog
          open={editSpecialistOpen}
          companyId={companyId}
          profile={specialist}
          onClose={() => setEditSpecialistOpen(false)}
          onSaved={() => {
            setEditSpecialistOpen(false);
            onSpecialistSaved?.();
          }}
        />
      ) : null}
    </>
  );
};
