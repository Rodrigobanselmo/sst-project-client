import CloseIcon from '@mui/icons-material/Close';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import {
  Box,
  Card,
  Chip,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import type {
  FormAiConceptualExplanationContent,
  FormAiContextualExplanationContent,
  FrpsExplanationItemType,
} from '@v2/services/forms/form-questions-answers-analysis/frps-explainability';
import { FRPS_EXPLAINABILITY_MODEL_OPTIONS } from '../ai-model-options';
import {
  FrpsConceptualContent,
  FrpsContextualContent,
  FrpsExplainabilityLoadingSkeleton,
} from './FrpsExplainabilityContent';
import { useFrpsExplainability } from './FrpsExplainabilityContext';
import {
  getConceptualValidationStatusLabel,
  getContextualValidationStatusLabel,
  getFrpsContextualJustificationTitle,
  getFrpsExplanationItemTypeLabel,
} from './frps-explainability.utils';
import { toSafeIsoDateLabel, normalizePersonLabel } from './frps-explainability-safe-content.util';
import { FRPS_EXPLAINABILITY_UI_COPY } from './frps-explainability-ui-copy';
import { FrpsExplainabilityDrawerErrorBoundary } from './FrpsExplainabilityDrawerErrorBoundary';

const METHODOLOGY_NOTICE =
  'Este conteúdo apoia a interpretação técnica dos resultados e não substitui a avaliação profissional, a investigação das condições reais de trabalho ou a validação das medidas pela organização.';

const PROTECTED_MESSAGE =
  'Este conteúdo não pode ser detalhado porque o recorte não atende ao número mínimo de participantes exigido para proteção do sigilo.';

function formatUpdatedAt(value?: string | Date | null) {
  return toSafeIsoDateLabel(value);
}

function statusChipLabel(status?: string | null) {
  if (status === 'VALIDATED') return 'Validado';
  if (status === 'DRAFT_AI') return 'Pendente';
  if (status === 'REJECTED') return 'Rejeitado';
  return status || '—';
}

function toEditableText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string').join('\n');
  }
  return '';
}

function TextEditField({
  label,
  value,
  onChange,
  multiline = true,
}: {
  label: string;
  value?: unknown;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <TextField
      label={label}
      value={toEditableText(value)}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
      size="small"
      multiline={multiline}
      minRows={multiline ? 2 : 1}
      sx={{ mb: 1.5 }}
    />
  );
}

function ConceptualEditForm({
  itemType,
  content,
  onChange,
}: {
  itemType: FrpsExplanationItemType;
  content: FormAiConceptualExplanationContent;
  onChange: (next: FormAiConceptualExplanationContent) => void;
}) {
  const set = (key: keyof FormAiConceptualExplanationContent, value: string) =>
    onChange({ ...content, [key]: value });

  if (itemType === 'SOURCE') {
    return (
      <>
        <TextEditField label="Definição" value={content.definition} onChange={(v) => set('definition', v)} />
        <TextEditField label="Relação com o fator de risco" value={content.relationToRiskFactor} onChange={(v) => set('relationToRiskFactor', v)} />
        <TextEditField
          label="Perguntas mensuráveis (uma por linha)"
          value={Array.isArray(content.measurableQuestions)
            ? content.measurableQuestions.filter((q) => typeof q === 'string').join('\n')
            : typeof content.measurableQuestions === 'string'
              ? content.measurableQuestions
              : ''}
          onChange={(v) =>
            onChange({
              ...content,
              measurableQuestions: v
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean),
            })
          }
        />
        <TextEditField label="Manifestações possíveis" value={content.organizationalManifestations} onChange={(v) => set('organizationalManifestations', v)} />
        <TextEditField label="Sinais favoráveis" value={content.favorableSignals} onChange={(v) => set('favorableSignals', v)} />
        <TextEditField label="Sinais intermediários" value={content.intermediateSignals} onChange={(v) => set('intermediateSignals', v)} />
        <TextEditField label="Sinais desfavoráveis" value={content.unfavorableSignals} onChange={(v) => set('unfavorableSignals', v)} />
        <TextEditField label="Limites de interpretação" value={content.interpretationLimits} onChange={(v) => set('interpretationLimits', v)} />
        <TextEditField label="Validação profissional" value={content.professionalValidationGuidance} onChange={(v) => set('professionalValidationGuidance', v)} />
      </>
    );
  }

  return (
    <>
      <TextEditField label="Objetivo" value={content.objective} onChange={(v) => set('objective', v)} />
      <TextEditField label="Relação com o fator de risco" value={content.relationToRiskFactor} onChange={(v) => set('relationToRiskFactor', v)} />
      <TextEditField
        label="Perguntas mensuráveis (uma por linha)"
        value={Array.isArray(content.measurableQuestions)
          ? content.measurableQuestions.filter((q) => typeof q === 'string').join('\n')
          : typeof content.measurableQuestions === 'string'
            ? content.measurableQuestions
            : ''}
        onChange={(v) =>
          onChange({
            ...content,
            measurableQuestions: v
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean),
          })
        }
      />
      <TextEditField label="Contribuição esperada" value={content.whyItMayReduceRisk} onChange={(v) => set('whyItMayReduceRisk', v)} />
      <TextEditField label="Orientações de implementação" value={content.implementationGuidance} onChange={(v) => set('implementationGuidance', v)} />
      <TextEditField label="Exemplos práticos" value={content.practicalExamples} onChange={(v) => set('practicalExamples', v)} />
      <TextEditField label="Resultados esperados" value={content.expectedResults} onChange={(v) => set('expectedResults', v)} />
      <TextEditField label="Indicadores de acompanhamento" value={content.monitoringIndicators} onChange={(v) => set('monitoringIndicators', v)} />
      <TextEditField label="Limitações e cuidados" value={content.limitationsAndCautions} onChange={(v) => set('limitationsAndCautions', v)} />
      <TextEditField label="Validação profissional" value={content.professionalValidationGuidance} onChange={(v) => set('professionalValidationGuidance', v)} />
    </>
  );
}

function ContextualEditForm({
  itemType,
  content,
  onChange,
}: {
  itemType: FrpsExplanationItemType;
  content: FormAiContextualExplanationContent;
  onChange: (next: FormAiContextualExplanationContent) => void;
}) {
  const set = (key: keyof FormAiContextualExplanationContent, value: string) =>
    onChange({ ...content, [key]: value });

  return (
    <>
      <TextEditField label="Resumo contextual" value={content.resumoContextual} onChange={(v) => set('resumoContextual', v)} />
      <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
        <InputLabel id="leitura-cenario-label">Leitura do cenário</InputLabel>
        <Select
          labelId="leitura-cenario-label"
          label="Leitura do cenário"
          value={content.leituraDoCenario || 'INTERMEDIARIO'}
          onChange={(event) =>
            onChange({
              ...content,
              leituraDoCenario: event.target
                .value as FormAiContextualExplanationContent['leituraDoCenario'],
            })
          }
        >
          <MenuItem value="FAVORAVEL">Favorável</MenuItem>
          <MenuItem value="INTERMEDIARIO">Intermediário</MenuItem>
          <MenuItem value="DESFAVORAVEL">Desfavorável</MenuItem>
        </Select>
      </FormControl>
      <TextEditField label="Evidências agregadas" value={content.evidenciasAgregadas} onChange={(v) => set('evidenciasAgregadas', v)} />
      <TextEditField label="Relação com o fator" value={content.relacaoComFator} onChange={(v) => set('relacaoComFator', v)} />
      <TextEditField label="Motivo da seleção" value={content.motivoDaSelecao} onChange={(v) => set('motivoDaSelecao', v)} />
      {itemType !== 'SOURCE' && (
        <TextEditField
          label="Adequação da recomendação"
          value={content.adequacaoDaRecomendacao}
          onChange={(v) => set('adequacaoDaRecomendacao', v)}
        />
      )}
      <TextEditField label="Limites de interpretação" value={content.limitesDeInterpretacao} onChange={(v) => set('limitesDeInterpretacao', v)} />
      <TextEditField label="Orientação de validação profissional" value={content.orientacaoDeValidacaoProfissional} onChange={(v) => set('orientacaoDeValidacaoProfissional', v)} />
    </>
  );
}

export function FrpsExplainabilityDrawer() {
  const {
    open,
    target,
    data,
    isLoading,
    phase,
    errorMessage,
    unavailableReason,
    resolvedItem,
    isMaster,
    selectedConceptualModel,
    setSelectedConceptualModel,
    isEditing,
    draftConceptual,
    draftContextual,
    setDraftConceptual,
    setDraftContextual,
    confirmGenerate,
    confirmGenerateContextual,
    startEditing,
    cancelEditing,
    saveDraft,
    closeExplainItem,
    retryExplainItem,
  } = useFrpsExplainability();

  const showResolvedItemDiagnostics =
    Boolean(resolvedItem) &&
    isMaster &&
    (phase === 'awaiting_master_generate' ||
      phase === 'unavailable' ||
      phase === 'error' ||
      (typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('frpsExplainDebug') ===
          '1'));

  const contextual = data?.contextual;
  const isProtected = contextual?.protectedData === true;
  const isReleased = contextual?.protectedData === false;
  const bothValidated =
    data?.conceptual?.validationStatus === 'VALIDATED' &&
    isReleased &&
    contextual?.validationStatus === 'VALIDATED';
  const showMasterActions = isMaster && phase === 'ready';
  const conceptualStatusLabel = data?.conceptual?.validationStatus
    ? getConceptualValidationStatusLabel(data.conceptual.validationStatus)
    : null;
  const contextualStatusLabel =
    isReleased && contextual?.validationStatus
      ? getContextualValidationStatusLabel(contextual.validationStatus)
      : null;
  const validatedByLabel = normalizePersonLabel(
    isReleased
      ? contextual && 'validatedByName' in contextual
        ? contextual.validatedByName
        : null
      : data?.conceptual?.validatedByName,
  );
  const validatedAtLabel = formatUpdatedAt(
    isReleased && contextual && 'validatedAt' in contextual
      ? contextual.validatedAt ||
          ('updatedAt' in contextual ? contextual.updatedAt : null)
      : data?.conceptual?.validatedAt,
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={isLoading ? undefined : closeExplainItem}
      PaperProps={{
        sx: {
          width: {
            xs: '100vw',
            sm: '90vw',
            md: '75vw',
            lg: '80vw',
          },
          maxWidth: '100vw',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <SFlex
          alignItems="flex-start"
          justifyContent="space-between"
          gap={2}
          sx={{ px: { xs: 2.5, md: 4 }, py: 3 }}
        >
          <Box minWidth={0} flex={1}>
            <SText variant="h6" fontSize={20} fontWeight="bold">
              Explicação técnica
            </SText>
            {target && (
              <Box mt={1}>
                <SText variant="body2" color="text.secondary" fontSize={13}>
                  {getFrpsExplanationItemTypeLabel(target.itemType)}
                </SText>
                <SText
                  variant="body1"
                  fontWeight="medium"
                  fontSize={16}
                  sx={{ mt: 0.5, lineHeight: 1.45 }}
                >
                  {target.itemName}
                </SText>
                {target.riskFactorName && (
                  <SText
                    variant="body2"
                    color="text.secondary"
                    fontSize={13}
                    sx={{ mt: 0.5 }}
                  >
                    Fator de risco: {target.riskFactorName}
                  </SText>
                )}
              </Box>
            )}
          </Box>
          <IconButton
            aria-label="Fechar explicação técnica"
            onClick={closeExplainItem}
            size="small"
            disabled={isLoading}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </SFlex>

        <Divider />

        <FrpsExplainabilityDrawerErrorBoundary onReset={retryExplainItem}>
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              px: { xs: 2.5, md: 4 },
              py: 3,
            }}
          >
          {isLoading && (
            <Box>
              <SText
                variant="body2"
                color="text.secondary"
                fontSize={13}
                sx={{ mb: 2, fontStyle: 'italic' }}
              >
                {phase === 'loading_generate'
                  ? 'Gerando explicação técnica…'
                  : phase === 'saving'
                    ? 'Salvando alterações…'
                    : 'Carregando conteúdo…'}
              </SText>
              <FrpsExplainabilityLoadingSkeleton />
            </Box>
          )}

          {!isLoading && errorMessage && (
            <Box>
              <SText
                variant="body2"
                color="error.main"
                fontSize={14}
                sx={{ mb: 2, lineHeight: 1.5 }}
              >
                {errorMessage}
              </SText>
              <SButton
                variant="outlined"
                size="s"
                text="Tentar novamente"
                onClick={retryExplainItem}
                buttonProps={{ type: 'button' }}
              />
              {showResolvedItemDiagnostics && resolvedItem && (
                <SText
                  variant="caption"
                  color="text.disabled"
                  fontSize={11}
                  sx={{ mt: 1.5, display: 'block', wordBreak: 'break-all' }}
                >
                  Identidade resolvida: {resolvedItem.itemType}
                  {resolvedItem.catalogId
                    ? ` · catalogId ${resolvedItem.catalogId}`
                    : ' · sem catalogId'}
                  {resolvedItem.itemKey ? ` · ${resolvedItem.itemKey}` : ''}
                </SText>
              )}
            </Box>
          )}

          {!isLoading && !errorMessage && phase === 'unavailable' && (
            <Box
              sx={{
                p: 3,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'grey.50',
              }}
            >
              <SText variant="body1" fontWeight="bold" fontSize={16} mb={1}>
                {unavailableReason === 'CONCEPTUAL_NOT_VALIDATED'
                  ? FRPS_EXPLAINABILITY_UI_COPY.commonConceptualUnavailableTitle
                  : unavailableReason === 'GLOBAL_CATALOG_LINK_REQUIRED'
                    ? FRPS_EXPLAINABILITY_UI_COPY.globalCatalogLinkRequiredTitle
                    : 'Explicação técnica ainda não disponível'}
              </SText>
              <SText
                variant="body2"
                color="text.secondary"
                fontSize={14}
                sx={{ mb: 2, lineHeight: 1.55 }}
              >
                {unavailableReason === 'CONCEPTUAL_NOT_VALIDATED'
                  ? 'Este item precisa ser preparado e validado por um usuário master antes da geração da justificativa desta análise.'
                  : unavailableReason === 'GLOBAL_CATALOG_LINK_REQUIRED'
                    ? FRPS_EXPLAINABILITY_UI_COPY.globalCatalogLinkRequiredBody
                    : 'Este conteúdo precisa ser gerado e validado por um usuário master antes de ficar disponível.'}
              </SText>
              <SButton
                variant="outlined"
                size="s"
                text="Fechar"
                onClick={closeExplainItem}
                buttonProps={{ type: 'button' }}
              />
              {showResolvedItemDiagnostics && resolvedItem && (
                <SText
                  variant="caption"
                  color="text.disabled"
                  fontSize={11}
                  sx={{ mt: 1.5, display: 'block', wordBreak: 'break-all' }}
                >
                  Identidade resolvida: {resolvedItem.itemType}
                  {resolvedItem.catalogId
                    ? ` · catalogId ${resolvedItem.catalogId}`
                    : ' · sem catalogId'}
                  {resolvedItem.itemKey ? ` · ${resolvedItem.itemKey}` : ''}
                </SText>
              )}
            </Box>
          )}

          {!isLoading &&
            !errorMessage &&
            phase === 'awaiting_contextual_generate' && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'grey.50',
                }}
              >
                {data?.conceptual && (
                  <Box mb={2}>
                    <SText variant="body2" color="text.secondary" fontSize={12} mb={1}>
                      {getConceptualValidationStatusLabel(
                        data.conceptual.validationStatus,
                      )}
                    </SText>
                    <SText variant="body1" fontWeight="bold" fontSize={15} mb={1}>
                      O que este item significa
                    </SText>
                    <FrpsConceptualContent
                      itemType={target?.itemType || data.conceptual.itemType}
                      content={data.conceptual.content}
                    />
                    <Divider sx={{ my: 2 }} />
                  </Box>
                )}
                <SText variant="body1" fontWeight="bold" fontSize={14} mb={1}>
                  {FRPS_EXPLAINABILITY_UI_COPY.commonAwaitingContextualTitle}
                </SText>
                <SText
                  variant="body2"
                  color="text.secondary"
                  fontSize={13}
                  sx={{ mb: 2, lineHeight: 1.5 }}
                >
                  {FRPS_EXPLAINABILITY_UI_COPY.commonAwaitingContextualBody}
                </SText>
                <SButton
                  variant="contained"
                  color="primary"
                  size="s"
                  text={FRPS_EXPLAINABILITY_UI_COPY.generateContextualButton}
                  onClick={() => void confirmGenerateContextual()}
                  buttonProps={{ type: 'button', disabled: isLoading }}
                />
              </Box>
            )}

          {!isLoading &&
            !errorMessage &&
            phase === 'awaiting_master_generate' &&
            isMaster && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'grey.50',
                }}
              >
                <SText variant="body1" fontWeight="bold" fontSize={14} mb={1}>
                  Modelo para primeira geração
                </SText>
                <SText
                  variant="body2"
                  color="text.secondary"
                  fontSize={13}
                  sx={{ mb: 2, lineHeight: 1.5 }}
                >
              {unavailableReason === 'NOT_GENERATED' ||
                  unavailableReason === 'CONCEPTUAL_NOT_GENERATED'
                    ? 'Nenhum conteúdo disponível. Escolha o modelo da explicação conceitual e gere explicitamente.'
                    : 'Escolha o modelo usado apenas na explicação conceitual.'}
                </SText>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="frps-conceptual-model-label">Modelo</InputLabel>
                  <Select
                    labelId="frps-conceptual-model-label"
                    label="Modelo"
                    value={selectedConceptualModel}
                    onChange={(event) =>
                      setSelectedConceptualModel(String(event.target.value))
                    }
                    disabled={isLoading}
                  >
                    {FRPS_EXPLAINABILITY_MODEL_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <SButton
                  variant="contained"
                  color="primary"
                  size="s"
                  text="Gerar explicação"
                  onClick={() => void confirmGenerate()}
                  buttonProps={{ type: 'button', disabled: isLoading }}
                />
                {showResolvedItemDiagnostics && resolvedItem && (
                  <SText
                    variant="caption"
                    color="text.disabled"
                    fontSize={11}
                    sx={{ mt: 1.5, display: 'block', wordBreak: 'break-all' }}
                  >
                    Identidade resolvida: {resolvedItem.itemType}
                    {resolvedItem.catalogId
                      ? ` · catalogId ${resolvedItem.catalogId}`
                      : ' · sem catalogId'}
                    {resolvedItem.itemKey
                      ? ` · ${resolvedItem.itemKey}`
                      : ''}
                  </SText>
                )}
              </Box>
            )}

          {!isLoading && !errorMessage && data && phase === 'ready' && (
            <SFlex direction="column" gap={3}>
              <FrpsExplainabilityDrawerErrorBoundary section="status">
                <SFlex direction="column" gap={0.5}>
                  {bothValidated && (
                    <SText variant="body2" color="success.main" fontSize={13} fontWeight="medium">
                      Conteúdo técnico validado
                    </SText>
                  )}
                  {conceptualStatusLabel && (
                    <SText variant="body2" color="text.secondary" fontSize={12}>
                      {conceptualStatusLabel}
                    </SText>
                  )}
                  {contextualStatusLabel && (
                    <SText variant="body2" color="text.secondary" fontSize={12}>
                      {contextualStatusLabel}
                    </SText>
                  )}
                  {bothValidated && validatedAtLabel && (
                    <SText variant="body2" color="text.secondary" fontSize={12}>
                      Validado em {validatedAtLabel}
                      {validatedByLabel ? ` · ${validatedByLabel}` : ''}
                    </SText>
                  )}
                </SFlex>
              </FrpsExplainabilityDrawerErrorBoundary>

              {showMasterActions && !isEditing && (
                <FrpsExplainabilityDrawerErrorBoundary section="master-actions">
                  <SFlex gap={1} flexWrap="wrap">
                    <SButton
                      variant="outlined"
                      size="s"
                      text="Editar conteúdo"
                      onClick={startEditing}
                      buttonProps={{ type: 'button', disabled: isProtected }}
                    />
                    {/* Validação conceitual: somente na Biblioteca FRPS (v1). */}
                  </SFlex>
                </FrpsExplainabilityDrawerErrorBoundary>
              )}

              {isEditing && draftConceptual && draftContextual && isReleased && (
                <SFlex direction="column" gap={2}>
                  <SText variant="body1" fontWeight="bold" fontSize={16}>
                    Editar — O que este item significa
                  </SText>
                  <ConceptualEditForm
                    itemType={target?.itemType || data.conceptual.itemType}
                    content={draftConceptual}
                    onChange={setDraftConceptual}
                  />
                  <Divider />
                  <SText variant="body1" fontWeight="bold" fontSize={16}>
                    Editar —{' '}
                    {getFrpsContextualJustificationTitle(
                      target?.itemType || contextual.itemType,
                    )}
                  </SText>
                  <ContextualEditForm
                    itemType={target?.itemType || contextual.itemType}
                    content={draftContextual}
                    onChange={setDraftContextual}
                  />
                  <SFlex gap={1} flexWrap="wrap">
                    <SButton
                      variant="outlined"
                      size="s"
                      text="Cancelar"
                      onClick={cancelEditing}
                      buttonProps={{ type: 'button' }}
                    />
                    <SButton
                      variant="outlined"
                      size="s"
                      text="Salvar rascunho"
                      onClick={() => void saveDraft()}
                      buttonProps={{ type: 'button', disabled: isLoading }}
                    />
                    {/* Validação conceitual: somente na Biblioteca FRPS (v1). */}
                  </SFlex>
                </SFlex>
              )}

              {!isEditing && isProtected && contextual && (
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 1,
                    backgroundColor: 'warning.50',
                    border: '1px solid',
                    borderColor: 'warning.light',
                  }}
                >
                  <SText variant="body1" fontWeight="bold" fontSize={15} mb={1}>
                    {contextual.label || 'Dados Protegidos'}
                  </SText>
                  <SText
                    variant="body2"
                    color="text.secondary"
                    fontSize={13}
                    sx={{ lineHeight: 1.55 }}
                  >
                    {PROTECTED_MESSAGE}
                  </SText>
                </Box>
              )}

              {!isEditing && isReleased && contextual && (
                <SFlex direction="column" gap={{ xs: 5, md: 6 }}>
                  <FrpsExplainabilityDrawerErrorBoundary section="conceptual">
                    <Box>
                      <SText
                        variant="body1"
                        fontWeight="bold"
                        fontSize={16}
                        sx={{ mb: 1.5 }}
                      >
                        O que este item significa
                      </SText>
                      <FrpsConceptualContent
                        itemType={target?.itemType || data.conceptual.itemType}
                        content={data.conceptual.content}
                      />
                    </Box>
                  </FrpsExplainabilityDrawerErrorBoundary>
                  <FrpsExplainabilityDrawerErrorBoundary section="contextual">
                    <Box
                      component="section"
                      aria-label={
                        FRPS_EXPLAINABILITY_UI_COPY.contextualJustificationBadge
                      }
                    >
                      <Chip
                        size="small"
                        label={
                          FRPS_EXPLAINABILITY_UI_COPY.contextualJustificationBadge
                        }
                        sx={{
                          mb: 1.25,
                          height: 22,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 0.6,
                          color: 'primary.dark',
                          bgcolor: 'rgba(25, 118, 210, 0.08)',
                          border: '1px solid',
                          borderColor: 'rgba(25, 118, 210, 0.2)',
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        gap={1}
                        sx={{ mb: 1 }}
                      >
                        <AnalyticsOutlinedIcon
                          fontSize="small"
                          color="primary"
                          sx={{ mt: 0.35, opacity: 0.85, flexShrink: 0 }}
                        />
                        <SText
                          variant="h6"
                          fontWeight="bold"
                          fontSize={18}
                          sx={{ lineHeight: 1.35 }}
                        >
                          {getFrpsContextualJustificationTitle(
                            target?.itemType || contextual.itemType,
                          )}
                        </SText>
                      </Box>
                      <SText
                        variant="body2"
                        color="text.secondary"
                        fontSize={13}
                        sx={{ mb: 2.5, lineHeight: 1.55, maxWidth: 720 }}
                      >
                        {FRPS_EXPLAINABILITY_UI_COPY.contextualJustificationIntro}
                      </SText>
                      <Card
                        variant="outlined"
                        elevation={0}
                        sx={{
                          p: { xs: 2, md: 2.5 },
                          borderRadius: 1,
                          borderColor: 'rgba(25, 118, 210, 0.22)',
                          backgroundColor: 'rgba(25, 118, 210, 0.035)',
                        }}
                      >
                        <FrpsContextualContent
                          itemType={target?.itemType || contextual.itemType}
                          content={
                            'content' in contextual ? contextual.content : null
                          }
                        />
                      </Card>
                    </Box>
                  </FrpsExplainabilityDrawerErrorBoundary>
                </SFlex>
              )}
            </SFlex>
          )}
          </Box>
        </FrpsExplainabilityDrawerErrorBoundary>

        <Divider />
        <Box sx={{ px: { xs: 2.5, md: 4 }, py: 2.5, backgroundColor: 'grey.50' }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 12, lineHeight: 1.6 }}
          >
            {METHODOLOGY_NOTICE}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
