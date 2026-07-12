import React, { useMemo, useRef, useState } from 'react';

import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { AiActionButtonGroup } from '@v2/components/molecules/AiActionButtonGroup/AiActionButtonGroup';
import { buildMasterAiRequestOverrides } from '@v2/components/molecules/AiActionButtonGroup/build-master-ai-request-overrides.util';
import type { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { SystemAiPromptConfigDialog } from '@v2/components/molecules/SystemAiPromptConfig/SystemAiPromptConfigDialog';
import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { useAccess } from 'core/hooks/useAccess';
import { ParagraphEnum } from 'project/enum/paragraph.enum';
import { useMutateAiCharacterizationAssist } from '@v2/services/security/characterization/characterization/ai-characterization-assist/hooks/useMutateAiCharacterizationAssist';
import type {
  AiCharacterizationAssistCompanyRole,
  AiCharacterizationAssistOutputIntent,
  AiCharacterizationAssistQuestionnaire,
  AiCharacterizationAssistResult,
  AiCharacterizationAssistScope,
  AiCharacterizationAssistTarget,
  AiTemporaryDocumentSource,
} from '@v2/services/security/characterization/characterization/ai-characterization-assist/service/ai-characterization-assist.types';

import type { IUseEditCharacterization } from '../../hooks/useEditCharacterization';
import { AiTemporaryPdfSourceField } from '../AiTemporaryPdfSourceField/AiTemporaryPdfSourceField';
import {
  assistItemsToDisplayValues,
  assistItemsToStoredValues,
  resolveAssistModeFromOutputIntent,
  sanitizeApplicableAssistText,
} from './characterization-ai-assist.utils';
import { CHARACTERIZATION_AI_ASSIST_FACTORY_DEFAULT_PROMPT } from './characterization-ai-assist-default-prompt.constant';

type CharacterizationArrayField = 'paragraphs' | 'activities' | 'considerations';

type FormState = AiCharacterizationAssistQuestionnaire & {
  userObservations: string;
  userProvidedSources: string;
  enableWebSearch: boolean;
};

const DEFAULT_FORM: FormState = {
  characterizationScope: 'THIRD_PARTY',
  companyRole: 'SERVICE_CONSULTING',
  characterizationTarget: 'VESSEL_PLATFORM_EQUIPMENT',
  outputIntent: 'GENERATE_FINAL',
  useAttachedPhotos: true,
  userObservations: '',
  userProvidedSources: '',
  enableWebSearch: false,
};

const WEB_SEARCH_CONSENT_MESSAGE =
  'Você está ativando a consulta a fontes externas da web. O sistema poderá acessar links informados e/ou pesquisar fontes públicas para apoiar a caracterização. As informações obtidas serão usadas como apoio técnico, mas podem estar incompletas, desatualizadas ou incorretas. A validação da autenticidade, pertinência e aplicação das informações é responsabilidade do usuário/responsável técnico antes da aprovação final. O uso da pesquisa pode aumentar o tempo e o custo da operação.';

const WEB_SEARCH_UNAVAILABLE_TITLE = 'Pesquisa web independente indisponível';

const WEB_SEARCH_UNAVAILABLE_FOOTER =
  'Consulte a administração do sistema para habilitação da pesquisa web independente.';

/** Fallback legado / API warning sem título estruturado */
const WEB_SEARCH_UNAVAILABLE_MESSAGE = `${WEB_SEARCH_UNAVAILABLE_TITLE}. Este recurso depende da habilitação do serviço de fontes externas e pode ser contratado sob demanda. Enquanto isso, você pode informar URLs específicas para que o sistema tente ler e utilizar como apoio técnico.`;

type Props = Pick<
  IUseEditCharacterization,
  'data' | 'onEditArrayContent' | 'setData'
> & {
  open: boolean;
  onClose: () => void;
};

const SOURCE_LABELS: Record<string, string> = {
  SYSTEM: 'Dados do sistema',
  USER: 'Informado pelo usuário',
  USER_PROVIDED_SOURCE: 'Fonte informada pelo usuário',
  WEB_SEARCH: 'Pesquisa web independente',
  AI_INFERENCE: 'Inferência da IA',
};

const URL_STATUS_LABELS: Record<string, string> = {
  READ_SUCCESS: 'Lida com sucesso',
  READ_FAILED: 'Falha na leitura',
  BLOCKED: 'Bloqueada',
  TRUNCATED: 'Lida (conteúdo truncado)',
};

const WEB_SEARCH_STATUS_LABELS: Record<string, string> = {
  SUCCESS: 'Concluída',
  PARTIAL: 'Parcial',
  UNAVAILABLE: 'Indisponível (serviço sob habilitação)',
  FAILED: 'Falhou',
  SKIPPED: 'Não solicitada',
};

const QuestionBlock: React.FC<{
  title: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}> = ({ title, value, onChange, options }) => (
  <Box sx={{ mb: 3 }}>
    <SText variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
      {title}
    </SText>
    <RadioGroup value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <FormControlLabel
          key={option.value}
          value={option.value}
          control={<Radio size="small" />}
          label={<Typography variant="body2">{option.label}</Typography>}
        />
      ))}
    </RadioGroup>
  </Box>
);

const ResultList: React.FC<{ items: string[]; emptyLabel: string }> = ({
  items,
  emptyLabel,
}) => {
  if (!items.length) {
    return (
      <SText variant="caption" color="text.secondary">
        {emptyLabel}
      </SText>
    );
  }

  return (
    <Box component="ul" sx={{ m: 0, pl: 2 }}>
      {items.map((item, index) => (
        <Box component="li" key={`${item}-${index}`} sx={{ mb: 0.5 }}>
          <SText variant="body2">{item}</SText>
        </Box>
      ))}
    </Box>
  );
};

const TextItemsPreview: React.FC<{
  items: AiCharacterizationAssistResult['description'];
}> = ({ items }) => {
  if (!items.length) {
    return (
      <SText variant="caption" color="text.secondary">
        Nenhum conteúdo sugerido.
      </SText>
    );
  }

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 1,
        p: 2,
        bgcolor: 'grey.50',
      }}
    >
      {items.map((item, index) => {
        const type = item.type || 'PARAGRAPH';
        const text = sanitizeApplicableAssistText(item.text);
        if (!text) return null;

        const isBullet =
          type === 'BULLET_0' || type === 'BULLET_1' || type === 'BULLET_2';
        const indentPx =
          type === 'BULLET_1' ? 2.5 : type === 'BULLET_2' ? 4.5 : isBullet ? 0.5 : 0;

        return (
          <Box
            key={`${item.text}-${index}`}
            sx={{
              mb: index < items.length - 1 ? (isBullet ? 0.75 : 1.5) : 0,
              pl: indentPx,
              display: isBullet ? 'flex' : 'block',
              alignItems: isBullet ? 'flex-start' : undefined,
              gap: isBullet ? 1 : undefined,
            }}
          >
            {isBullet && (
              <SText
                variant="body2"
                component="span"
                sx={{ lineHeight: 1.5, flexShrink: 0, userSelect: 'none' }}
              >
                •
              </SText>
            )}
            <SText
              variant="body2"
              sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}
            >
              {text}
            </SText>
          </Box>
        );
      })}
    </Box>
  );
};

export const CharacterizationAiAssistModal: React.FC<Props> = ({
  open,
  onClose,
  data: characterizationData,
  onEditArrayContent,
  setData,
}) => {
  const { isMaster } = useAccess();
  const { showConfirmation } = useConfirmationModal();
  const assistMutation = useMutateAiCharacterizationAssist();

  const [step, setStep] = useState<'form' | 'result'>('form');
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [temporaryDocumentSource, setTemporaryDocumentSource] =
    useState<AiTemporaryDocumentSource | null>(null);
  const [result, setResult] = useState<AiCharacterizationAssistResult | null>(
    null,
  );
  const [aiConfigDialogOpen, setAiConfigDialogOpen] = useState(false);
  const [aiMasterConfig, setAiMasterConfig] = useState<SystemAiMasterConfig>({});
  const ignoreAssistCloseRef = useRef(false);

  const canAssist = Boolean(
    characterizationData.id &&
      characterizationData.companyId &&
      characterizationData.workspaceId,
  );

  const photosCount = characterizationData.photos?.length ?? 0;

  const resetModal = () => {
    setStep('form');
    setForm(DEFAULT_FORM);
    setTemporaryDocumentSource(null);
    setResult(null);
    setAiMasterConfig({});
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleAssistDialogClose = () => {
    // Nested SystemAiPromptConfigDialog close can fall through to this Dialog's backdrop.
    if (aiConfigDialogOpen || ignoreAssistCloseRef.current) return;
    handleClose();
  };

  const closePromptConfigDialog = () => {
    ignoreAssistCloseRef.current = true;
    setAiConfigDialogOpen(false);
    window.setTimeout(() => {
      ignoreAssistCloseRef.current = false;
    }, 300);
  };

  const handleApplyPromptConfig = (config: SystemAiMasterConfig) => {
    setAiMasterConfig(config);
    closePromptConfigDialog();
  };

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleGenerate = async () => {
    if (!canAssist) return;

    let webSearchConsentAccepted = false;
    if (form.enableWebSearch) {
      const confirmed = await showConfirmation({
        title: 'Confirmar pesquisa web independente',
        message: WEB_SEARCH_CONSENT_MESSAGE,
        confirmText: 'Concordo e gerar',
        cancelText: 'Cancelar',
        variant: 'warning',
      });
      if (!confirmed) return;
      webSearchConsentAccepted = true;
    }

    const masterOverrides = buildMasterAiRequestOverrides(
      isMaster,
      aiMasterConfig,
    );

    const response = await assistMutation.mutateAsync({
      companyId: characterizationData.companyId,
      workspaceId: characterizationData.workspaceId,
      characterizationId: characterizationData.id as string,
      mode: resolveAssistModeFromOutputIntent(form.outputIntent),
      questionnaire: {
        characterizationScope: form.characterizationScope,
        companyRole: form.companyRole,
        characterizationTarget: form.characterizationTarget,
        outputIntent: form.outputIntent,
        useAttachedPhotos: form.useAttachedPhotos,
      },
      userObservations: form.userObservations.trim() || undefined,
      userProvidedSources: form.userProvidedSources.trim() || undefined,
      temporaryDocumentSources: temporaryDocumentSource
        ? [temporaryDocumentSource]
        : undefined,
      enableWebSearch: form.enableWebSearch || undefined,
      webSearchConsentAccepted: webSearchConsentAccepted || undefined,
      customPrompt: masterOverrides.customPrompt,
      model: masterOverrides.model,
    });

    setResult(response);
    setStep('result');
  };

  const fieldHasContent = (field: CharacterizationArrayField) =>
    (characterizationData[field] || []).length > 0;

  const applyField = async (
    field: CharacterizationArrayField,
    items: AiCharacterizationAssistResult['description'],
    defaultType: ParagraphEnum,
    fieldLabel: string,
    mode: 'append' | 'replace',
  ) => {
    if (!items.length) return;

    const storedValues = assistItemsToStoredValues(items, defaultType);
    const hasContent = fieldHasContent(field);

    if (hasContent) {
      const confirmed = await showConfirmation({
        title: 'Aplicar sugestão da IA',
        message:
          mode === 'append'
            ? `Este campo (${fieldLabel}) já possui conteúdo. Deseja adicionar o texto sugerido ao final?`
            : `Este campo (${fieldLabel}) já possui conteúdo. Deseja substituir todo o conteúdo pelo texto sugerido?`,
        confirmText: mode === 'append' ? 'Adicionar ao final' : 'Substituir',
        cancelText: 'Cancelar',
        variant: 'warning',
      });

      if (!confirmed) return;
    }

    if (mode === 'replace' || !hasContent) {
      onEditArrayContent(
        assistItemsToDisplayValues(items).map((item) => ({
          name: item.name,
          type: convertDisplayType(item.type, defaultType),
        })),
        field,
        defaultType,
      );
      return;
    }

    setData((oldData) => ({
      ...oldData,
      [field]: [...(oldData[field] || []), ...storedValues],
    }));
  };

  const convertDisplayType = (
    type: ParagraphEnum,
    defaultType: ParagraphEnum,
  ): ParagraphEnum => type || defaultType;

  const ApplyFieldActions: React.FC<{
    field: CharacterizationArrayField;
    items: AiCharacterizationAssistResult['description'];
    defaultType: ParagraphEnum;
    label: string;
  }> = ({ field, items, defaultType, label }) => {
    const hasItems = items.length > 0;
    const hasExisting = fieldHasContent(field);

    if (!hasItems) {
      return (
        <SText variant="caption" color="text.secondary">
          Nenhum conteúdo sugerido para aplicar.
        </SText>
      );
    }

    return (
      <SFlex gap={1} flexWrap="wrap" align="center">
        {!hasExisting ? (
          <SButton
            text={`Aplicar em ${label}`}
            variant="shade"
            size="s"
            onClick={() => void applyField(field, items, defaultType, label, 'replace')}
          />
        ) : (
          <>
            <SButton
              text="Adicionar ao final"
              variant="shade"
              size="s"
              onClick={() => void applyField(field, items, defaultType, label, 'append')}
            />
            <SButton
              text="Substituir conteúdo"
              variant="outlined"
              size="s"
              onClick={() => void applyField(field, items, defaultType, label, 'replace')}
            />
          </>
        )}
      </SFlex>
    );
  };

  const scopeOptions = useMemo(
    () =>
      [
        ['OWN_ESTABLISHMENT', 'Estabelecimento próprio'],
        ['THIRD_PARTY', 'Estabelecimento de terceiro'],
        ['EXTERNAL_ITINERANT', 'Atividade externa/itinerante'],
        ['SPECIFIC_EQUIPMENT', 'Equipamento/unidade operacional específica'],
      ] as [AiCharacterizationAssistScope, string][],
    [],
  );

  const companyRoleOptions = useMemo(
    () =>
      [
        ['DIRECT_OPERATOR', 'Opera diretamente o processo'],
        ['SERVICE_CONSULTING', 'Apenas presta serviço/consultoria/acompanhamento'],
        ['MAINTENANCE', 'Executa manutenção/atividade operacional'],
        ['ADMINISTRATIVE', 'Atua administrativamente'],
      ] as [AiCharacterizationAssistCompanyRole, string][],
    [],
  );

  const targetOptions = useMemo(
    () =>
      [
        ['FULL_ESTABLISHMENT', 'Estabelecimento inteiro'],
        ['SECTOR', 'Setor'],
        ['WORKSTATION', 'Posto de trabalho'],
        ['ACTIVITY', 'Atividade'],
        ['VESSEL_PLATFORM_EQUIPMENT', 'Embarcação/plataforma/equipamento'],
        ['WORK_FRONT', 'Frente de trabalho'],
      ] as [AiCharacterizationAssistTarget, string][],
    [],
  );

  const outputIntentOptions = useMemo(
    () =>
      [
        ['GENERATE_FINAL', 'Gerar texto final para preencher os campos'],
        ['REVIEW_EXISTING', 'Revisar texto existente'],
        ['CRITICAL_ONLY', 'Fazer análise crítica sem entregar texto final pronto'],
      ] as [AiCharacterizationAssistOutputIntent, string][],
    [],
  );

  return (
    <>
      <Dialog
        open={open}
        onClose={handleAssistDialogClose}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={aiConfigDialogOpen}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoFixHighOutlinedIcon color="primary" fontSize="small" />
          Assistente IA da Caracterização
        </DialogTitle>

        <DialogContent dividers>
          {!canAssist && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Salve a caracterização primeiro para utilizar o assistente de IA.
            </Alert>
          )}

          {step === 'form' && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Responda às perguntas para orientar a IA sobre o papel real da
                empresa avaliada. Nada será salvo automaticamente.
              </Alert>

              {isMaster &&
                Boolean(
                  aiMasterConfig.customPrompt?.trim() || aiMasterConfig.model,
                ) && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Configuração temporária de prompt/modelo aplicada nesta sessão.
                    A geração usará essa configuração até você fechar o Assistente
                    IA.
                  </Alert>
                )}

              <QuestionBlock
                title="1. Esta caracterização é de:"
                value={form.characterizationScope}
                onChange={(value) =>
                  updateForm(
                    'characterizationScope',
                    value as AiCharacterizationAssistScope,
                  )
                }
                options={scopeOptions.map(([value, label]) => ({ value, label }))}
              />

              <QuestionBlock
                title="2. A empresa avaliada:"
                value={form.companyRole}
                onChange={(value) =>
                  updateForm(
                    'companyRole',
                    value as AiCharacterizationAssistCompanyRole,
                  )
                }
                options={companyRoleOptions.map(([value, label]) => ({
                  value,
                  label,
                }))}
              />

              <QuestionBlock
                title="3. O que será caracterizado:"
                value={form.characterizationTarget}
                onChange={(value) =>
                  updateForm(
                    'characterizationTarget',
                    value as AiCharacterizationAssistTarget,
                  )
                }
                options={targetOptions.map(([value, label]) => ({ value, label }))}
              />

              <QuestionBlock
                title="4. Deseja que a IA:"
                value={form.outputIntent}
                onChange={(value) =>
                  updateForm(
                    'outputIntent',
                    value as AiCharacterizationAssistOutputIntent,
                  )
                }
                options={outputIntentOptions.map(([value, label]) => ({
                  value,
                  label,
                }))}
              />

              <Box sx={{ mb: 3 }}>
                <SText variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Fontes opcionais
                </SText>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={form.useAttachedPhotos}
                      onChange={(e) =>
                        updateForm('useAttachedPhotos', e.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Usar fotos já anexadas ({photosCount} foto
                      {photosCount === 1 ? '' : 's'})
                    </Typography>
                  }
                />
                <TextField
                  label="Observações livres"
                  value={form.userObservations}
                  onChange={(e) => updateForm('userObservations', e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                  placeholder="Ex.: empresa presta assessoria de SMS e circula em áreas autorizadas..."
                />
                <TextField
                  label="Links, trechos ou dados pesquisados manualmente"
                  value={form.userProvidedSources}
                  onChange={(e) =>
                    updateForm('userProvidedSources', e.target.value)
                  }
                  multiline
                  minRows={2}
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                  placeholder="Cole links (https://...) e/ou trechos técnicos. O sistema tentará acessar as URLs informadas."
                  helperText="URLs serão acessadas pelo sistema antes da geração. Se a leitura falhar, isso aparecerá nas cautelas/incertezas."
                />

                <FormControlLabel
                  sx={{ mt: 2, alignItems: 'flex-start' }}
                  control={
                    <Checkbox
                      size="small"
                      checked={form.enableWebSearch}
                      onChange={(e) =>
                        updateForm('enableWebSearch', e.target.checked)
                      }
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">
                        Pesquisar fontes externas na web
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Opcional e desmarcada por padrão. A leitura das URLs que
                        você informar continua disponível. A pesquisa web
                        independente depende da habilitação do serviço de fontes
                        externas e pode ser contratada sob demanda; se não
                        estiver habilitada, o resultado informará indisponível
                        de forma controlada.
                      </Typography>
                    </Box>
                  }
                />

                {form.enableWebSearch && (
                  <Alert severity="warning" sx={{ mt: 1.5 }}>
                    {WEB_SEARCH_CONSENT_MESSAGE}
                  </Alert>
                )}

                <AiTemporaryPdfSourceField
                  companyId={characterizationData.companyId}
                  workspaceId={characterizationData.workspaceId}
                  characterizationId={characterizationData.id as string}
                  value={temporaryDocumentSource}
                  onChange={setTemporaryDocumentSource}
                  disabled={assistMutation.isPending}
                />
              </Box>
            </Box>
          )}

          {step === 'result' && result && (
            <Box>
              {result.suggestedName && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Nome sugerido (não aplicado automaticamente):</strong>{' '}
                  {result.suggestedName}
                </Alert>
              )}

              {(result.cautions.length > 0 ||
                result.uncertaintyPoints.length > 0 ||
                result.inconsistencies.length > 0) && (
                <Box sx={{ mb: 3 }}>
                  {result.cautions.map((item, index) => (
                    <Alert key={`caution-${index}`} severity="warning" sx={{ mb: 1 }}>
                      {item}
                    </Alert>
                  ))}
                  {result.uncertaintyPoints.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <SText variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Pontos de incerteza
                      </SText>
                      <ResultList
                        items={result.uncertaintyPoints}
                        emptyLabel="Nenhum ponto de incerteza."
                      />
                    </Box>
                  )}
                  {result.inconsistencies.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <SText variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Inconsistências
                      </SText>
                      <ResultList
                        items={result.inconsistencies}
                        emptyLabel="Nenhuma inconsistência identificada."
                      />
                    </Box>
                  )}
                </Box>
              )}

              {result.externalSources && (
                <Box sx={{ mb: 3 }}>
                  <SText variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Fontes externas processadas
                  </SText>
                  {result.externalSources.userProvidedUrls.length === 0 ? (
                    <SText variant="caption" color="text.secondary">
                      Nenhuma URL detectada no campo de fontes.
                    </SText>
                  ) : (
                    <SFlex gap={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
                      {result.externalSources.userProvidedUrls.map((item) => (
                        <Chip
                          key={`${item.url}-${item.status}`}
                          size="small"
                          color={
                            item.status === 'READ_SUCCESS' ||
                            item.status === 'TRUNCATED'
                              ? 'success'
                              : item.status === 'BLOCKED'
                                ? 'warning'
                                : 'default'
                          }
                          variant="outlined"
                          label={`${URL_STATUS_LABELS[item.status] ?? item.status}: ${item.title || item.url}`}
                        />
                      ))}
                    </SFlex>
                  )}
                  <Alert
                    severity={
                      result.externalSources.webSearch.status === 'UNAVAILABLE'
                        ? 'warning'
                        : result.externalSources.webSearch.status === 'FAILED'
                          ? 'error'
                          : 'info'
                    }
                    icon={
                      result.externalSources.webSearch.status === 'UNAVAILABLE' ? (
                        <WarningAmberRoundedIcon sx={{ fontSize: 32 }} />
                      ) : undefined
                    }
                    sx={
                      result.externalSources.webSearch.status === 'UNAVAILABLE'
                        ? {
                            mt: 2,
                            py: 2.5,
                            px: 2.5,
                            border: '2px solid',
                            borderColor: 'warning.dark',
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(237, 108, 2, 0.16)'
                                : 'rgba(255, 244, 229, 1)',
                            '& .MuiAlert-icon': {
                              color: 'warning.dark',
                              alignItems: 'center',
                              mr: 2,
                            },
                            '& .MuiAlert-message': { width: '100%', py: 0.5 },
                          }
                        : { mt: 1 }
                    }
                  >
                    {result.externalSources.webSearch.status === 'UNAVAILABLE' ? (
                      <>
                        <AlertTitle sx={{ fontWeight: 800, mb: 1, fontSize: '1.05rem' }}>
                          {WEB_SEARCH_UNAVAILABLE_TITLE}
                        </AlertTitle>
                        <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.55 }}>
                          <strong>
                            Este recurso depende da habilitação do serviço de fontes
                            externas
                          </strong>{' '}
                          e pode ser contratado sob demanda. Enquanto isso, você pode
                          informar URLs específicas para que o sistema tente ler e
                          utilizar como apoio técnico.
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.5, opacity: 0.95 }}>
                          {result.externalSources.webSearch.warning &&
                          result.externalSources.webSearch.warning !==
                            WEB_SEARCH_UNAVAILABLE_MESSAGE
                            ? result.externalSources.webSearch.warning
                            : WEB_SEARCH_UNAVAILABLE_FOOTER}
                        </Typography>
                      </>
                    ) : (
                      <>
                        Pesquisa web:{' '}
                        {WEB_SEARCH_STATUS_LABELS[
                          result.externalSources.webSearch.status
                        ] ?? result.externalSources.webSearch.status}
                        {result.externalSources.webSearch.warning
                          ? ` — ${result.externalSources.webSearch.warning}`
                          : ''}
                        {result.externalSources.webSearch.results.length > 0
                          ? ` (${result.externalSources.webSearch.results.length} fonte(s))`
                          : ''}
                      </>
                    )}
                  </Alert>
                </Box>
              )}

              {result.sourceClassification &&
                result.sourceClassification.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <SText variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Classificação de fontes
                    </SText>
                    <SFlex gap={1} flexWrap="wrap">
                      {result.sourceClassification.map((item, index) => (
                        <Chip
                          key={`${item.label}-${index}`}
                          size="small"
                          label={`${item.label}: ${SOURCE_LABELS[item.source] ?? item.source}`}
                          variant="outlined"
                        />
                      ))}
                    </SFlex>
                  </Box>
                )}

              <Box sx={{ mb: 3 }}>
                <SText variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Descrição sugerida
                </SText>
                <TextItemsPreview items={result.description} />
                <Box sx={{ mt: 1 }}>
                  <ApplyFieldActions
                    field="paragraphs"
                    items={result.description}
                    defaultType={ParagraphEnum.PARAGRAPH}
                    label="Descrição"
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <SText variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Processos / atividades sugeridos
                </SText>
                <TextItemsPreview items={result.workActivities} />
                <Box sx={{ mt: 1 }}>
                  <ApplyFieldActions
                    field="activities"
                    items={result.workActivities}
                    defaultType={ParagraphEnum.BULLET_0}
                    label="Atividades"
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 1 }}>
                <SText variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Considerações sugeridas
                </SText>
                <TextItemsPreview items={result.considerations} />
                <Box sx={{ mt: 1 }}>
                  <ApplyFieldActions
                    field="considerations"
                    items={result.considerations}
                    defaultType={ParagraphEnum.BULLET_0}
                    label="Considerações"
                  />
                </Box>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                Após aplicar os campos desejados, salve a caracterização pelo
                botão normal da tela.
              </Alert>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleClose} color="inherit">
            Fechar
          </Button>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {step === 'result' && (
              <Button onClick={() => setStep('form')} color="inherit">
                Voltar às perguntas
              </Button>
            )}

            {step === 'form' && (
              <AiActionButtonGroup
                label="Gerar rascunho com IA"
                loading={assistMutation.isPending}
                disabled={!canAssist || assistMutation.isPending}
                onExecute={() => void handleGenerate()}
                onConfigure={
                  isMaster ? () => setAiConfigDialogOpen(true) : undefined
                }
                isMaster={isMaster}
                variant="s-button-contained"
              />
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {isMaster && (
        <SystemAiPromptConfigDialog
          open={aiConfigDialogOpen}
          onClose={closePromptConfigDialog}
          onApply={handleApplyPromptConfig}
          initialConfig={aiMasterConfig}
          promptKey={SystemAiPromptKeyEnum.CHARACTERIZATION_AI_ASSIST}
          title="Configurar Assistente IA da Caracterização"
          description="Configuração avançada disponível apenas para usuários MASTER. Aplicar vale para esta sessão. Definir como prompt padrão persiste para todo o sistema."
          factoryDefaultPrompt={CHARACTERIZATION_AI_ASSIST_FACTORY_DEFAULT_PROMPT}
          promptLabel="Prompt completo do Assistente IA"
          saveDefaultConfirmMessage="O conteúdo atual será salvo como prompt padrão do sistema para o Assistente IA da Caracterização. Deseja continuar?"
          maxWidth="xl"
          promptMinRows={8}
          promptMaxRows={30}
        />
      )}
    </>
  );
};
