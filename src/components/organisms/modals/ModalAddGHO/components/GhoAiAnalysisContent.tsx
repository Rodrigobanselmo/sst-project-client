/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import { AiActionButtonGroup } from '@v2/components/molecules/AiActionButtonGroup/AiActionButtonGroup';
import { buildMasterAiRequestOverrides } from '@v2/components/molecules/AiActionButtonGroup/build-master-ai-request-overrides.util';
import type { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { SystemAiPromptConfigDialog } from '@v2/components/molecules/SystemAiPromptConfig/SystemAiPromptConfigDialog';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { QueryEnum } from 'core/enums/query.enums';
import { useAccess } from 'core/hooks/useAccess';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { useMutUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { queryClient } from 'core/services/queryClient';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';

import { isAiAnalyzeRequestCanceled } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/is-ai-analyze-request-canceled.util';
import type {
  AiRiskFieldSuggestion,
  ExistingRiskReview,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import { parseAiTemporarySourceGsePdf } from '@v2/services/security/homogeneous-group/ai-analyze-gse/service/parse-ai-temporary-source-gse-pdf.service';
import { transcribeAiAnalyzeGseAudio } from '@v2/services/security/homogeneous-group/ai-analyze-gse/service/transcribe-ai-analyze-gse-audio.service';
import { useMutateAiAnalyzeGse } from '@v2/services/security/homogeneous-group/ai-analyze-gse/hooks/useMutateAiAnalyzeGse';
import { IErrorResp } from '@v2/types/error.type';

import { CharacterizationAiRiskAnalysisState } from '../../ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState';
import { AiSessionAnalysesPanel } from '../../ModalAddCharacterization/components/AiSessionAnalysesPanel/AiSessionAnalysesPanel';
import { summarizeAiSessionAnalysis } from '../../ModalAddCharacterization/utils/summarize-ai-session-analysis.util';
import { AiColumnSuggestionsSummary } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/AiColumnSuggestionsSummary';
import {
  columnForAiField,
  withoutColumnSuggestions,
} from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/risk-factor-ai-pending.util';
import { AiTemporaryPdfSourceField } from '../../ModalAddCharacterization/components/AiTemporaryPdfSourceField/AiTemporaryPdfSourceField';
import { AiAnalyzeGuidanceAudioField } from '../../ModalAddCharacterization/components/ModalAiAnalysisContent/AiAnalyzeGuidanceAudioField';
import { appendTranscribedGuidance } from '../../ModalAddCharacterization/components/ModalAiAnalysisContent/append-transcribed-guidance.util';
import { buildModularRiskUpsert } from '../../ModalAddCharacterization/components/ModalAiAnalysisContent/build-modular-risk-upsert.util';
import { riskDataAlreadyContainsFieldValue } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/risk-factors-ai-scope.util';
import {
  existenceConfirmationCopy,
  resolveSuggestionApplyValue,
} from '../../ModalAddCharacterization/components/ModalAiAnalysisContent/suggestion-apply-plan.util';
import { filterNewAiRiskSuggestions } from '../../ModalAddCharacterization/components/ModalAiAnalysisContent/filter-new-ai-risk-suggestions.util';
import {
  buildModularSuggestionKey,
  isEquivalentApplyInFlight,
} from '../../ModalAddCharacterization/components/ModalAiAnalysisContent/ai-risk-field-suggestion.util';
import { AiExistingRiskReviewCard } from '../../ModalAddCharacterization/components/ModalAiAnalysisContent/AiExistingRiskReviewCard';
import { AiRiskSuggestionCard } from '../../ModalAddCharacterization/components/ModalAiAnalysisContent/AiRiskSuggestionCard';
import { useAiRiskSuggestionEdits } from '../../ModalAddCharacterization/components/ModalAiAnalysisContent/useAiRiskSuggestionEdits';
import { getCurrentRiskGroupId } from '../../ModalAddCharacterization/utils/get-current-risk-group-id.util';
import { sortExistingRiskData } from '../../ModalAddCharacterization/utils/sort-existing-risk-data.util';
import {
  GSE_AI_ANALYZE_NO_WORKSPACE_MESSAGE,
  GSE_AI_ANALYZE_WORKSPACE_REQUIRED,
} from '../gse-ai-analyze.constants';
import { getGseLinkedWorkspaceIds } from '../get-gse-linked-workspace-ids.util';
import { initialAddGhoState } from '../hooks/useAddGho';
import { GSE_WIZARD_TAB_LABELS } from '../gse-wizard-steps';
import { buildGseAddRiskPayload } from './build-gse-add-risk-payload.util';
import { buildGseAiAnalyzeRequestBody } from './build-gse-ai-analyze-request.util';

const summarizeRiskDataLabels = (
  items: Array<{ name?: string; medName?: string; recName?: string }> | undefined,
  limit = 3,
): string => {
  if (!items?.length) return '';
  const labels = items
    .map((item) => item.name || item.medName || item.recName || '')
    .map((label) => label.trim())
    .filter(Boolean);
  if (!labels.length) return '';
  if (labels.length <= limit) return labels.join(', ');
  return `${labels.slice(0, limit).join(', ')} +${labels.length - limit}`;
};

const getApiErrorCode = (error: unknown): string | undefined => {
  const data = (error as IErrorResp | undefined)?.response?.data;
  return typeof data?.code === 'string' ? data.code : undefined;
};

/** `full` = aba "Análise de Riscos IA". `risksTabDialog` = diálogo da aba Fatores. */
export type GhoAiAnalysisPresentation = 'full' | 'risksTabDialog';

type GhoAiAnalysisContentProps = {
  companyId: string;
  ghoData: typeof initialAddGhoState;
  ghoQuery: IGho;
  aiRiskAnalysis: CharacterizationAiRiskAnalysisState;
  presentation?: GhoAiAnalysisPresentation;
  /** Fecha o diálogo da aba Fatores após o resumo (somente risksTabDialog). */
  onCloseDialog?: () => void;
};

export const GhoAiAnalysisContent = ({
  companyId,
  ghoData,
  ghoQuery,
  aiRiskAnalysis,
  presentation = 'full',
  onCloseDialog,
}: GhoAiAnalysisContentProps) => {
  const isRisksTabDialog = presentation === 'risksTabDialog';
  const summarySectionRef = useRef<HTMLDivElement | null>(null);
  const gseId = ghoData.id;
  const workspaceIds = getGseLinkedWorkspaceIds(ghoData, ghoQuery);
  const hasLinkedWorkspace = workspaceIds.length > 0;
  const { isMaster } = useAccess();
  const { showConfirmation } = useConfirmationModal();
  const { companyId: contextCompanyId, workspaceId: pageWorkspaceId } =
    useGetCompanyId();
  const routeWorkspaceId = pageWorkspaceId || workspaceIds[0];
  const { data: riskGroupData } = useQueryRiskGroupData(companyId || undefined);
  const riskGroupId = useMemo(
    () => getCurrentRiskGroupId(riskGroupData),
    [riskGroupData],
  );

  const {
    visibleSuggestions,
    existingRiskReviews,
    addedRiskIdsSet,
    dismissedRiskIds,
    modifiedRisks,
    setModifiedRisks,
    userGuidance,
    setUserGuidance,
    temporaryDocumentSource,
    setTemporaryDocumentSource,
    hasAnalyzed,
    mergeIncomingSuggestions,
    mergeIncomingExistingRiskReviews,
    markAnalyzed,
    reconcileWithExistingRiskIds,
    markRiskAdded,
    markModularSuggestionApplied,
    dismissSuggestion,
    expandedSuggestionIdsSet,
    appliedModularSuggestionKeysSet,
    dismissedModularSuggestionKeysSet,
    setSuggestionExpanded,
    expandAllSuggestions,
    collapseAllSuggestions,
  } = aiRiskAnalysis;
  const suggestionEdits = useAiRiskSuggestionEdits({
    visibleSuggestions,
    modifiedRisks,
    setModifiedRisks,
  });
  const { getCurrentRisk } = suggestionEdits;

  const [aiConfigDialogOpen, setAiConfigDialogOpen] = useState(false);
  const [aiMasterConfig, setAiMasterConfig] = useState<SystemAiMasterConfig>({});
  const applyingLock = useRef<string | null>(null);
  const [applyingSuggestionKey, setApplyingSuggestionKey] = useState<string | null>(
    null,
  );
  const [guidanceAudioBusy, setGuidanceAudioBusy] = useState(false);
  const analyzeAbortControllerRef = useRef<AbortController | null>(null);
  const analyzeRequestIdRef = useRef(0);

  const aiAnalyzeMutation = useMutateAiAnalyzeGse();
  const upsertRiskDataMutation = useMutUpsertRiskData();
  const {
    data: existingRiskData = [],
    refetch: refetchExistingRiskData,
  } = useQueryRiskDataByGho(riskGroupId || '', gseId || '');

  const sortedExistingRiskData = useMemo(
    () => sortExistingRiskData(existingRiskData),
    [existingRiskData],
  );
  const existingRiskIds = useMemo(
    () => new Set(sortedExistingRiskData.map((item) => item.riskId).filter(Boolean)),
    [sortedExistingRiskData],
  );
  const existingRiskDataByRiskId = useMemo(() => {
    const map = new Map<string, IRiskData>();
    sortedExistingRiskData.forEach((riskData) => {
      if (riskData.riskId) map.set(riskData.riskId, riskData);
    });
    return map;
  }, [sortedExistingRiskData]);

  useEffect(() => {
    reconcileWithExistingRiskIds(existingRiskIds);
  }, [existingRiskIds, reconcileWithExistingRiskIds]);

  const newRiskSuggestions = useMemo(
    () =>
      filterNewAiRiskSuggestions({
        suggestions: visibleSuggestions,
        existingRiskIds,
        addedRiskIds: addedRiskIdsSet,
      }),
    [visibleSuggestions, existingRiskIds, addedRiskIdsSet],
  );
  const newRiskSuggestionIds = newRiskSuggestions.map((risk) => risk.id);
  const visibleExistingRiskReviews = existingRiskReviews.filter((review) =>
    existingRiskIds.has(review.riskId),
  );
  const modalExistingRiskReviews = withoutColumnSuggestions(
    visibleExistingRiskReviews,
  );
  const reviewAccordionIds = modalExistingRiskReviews.map(
    (review) => `review:${review.riskId}`,
  );

  const sessionSummary = useMemo(
    () =>
      summarizeAiSessionAnalysis({
        hasAnalyzed,
        pendingNewRiskCount: newRiskSuggestions.length,
        pendingReviewCount: visibleExistingRiskReviews.length,
        acceptedNewRiskCount: addedRiskIdsSet.size,
        acceptedModularCount: appliedModularSuggestionKeysSet.size,
        discardedNewRiskCount: dismissedRiskIds.length,
        discardedModularCount: dismissedModularSuggestionKeysSet.size,
      }),
    [
      hasAnalyzed,
      newRiskSuggestions.length,
      visibleExistingRiskReviews.length,
      addedRiskIdsSet,
      appliedModularSuggestionKeysSet,
      dismissedRiskIds.length,
      dismissedModularSuggestionKeysSet,
    ],
  );

  const handleViewSessionSummary = useCallback(() => {
    summarySectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

  const refreshExistingRisks = useCallback(async () => {
    const companyIdForQuery = companyId || contextCompanyId;
    await queryClient.invalidateQueries([QueryEnum.RISK_DATA, companyIdForQuery]);
    if (riskGroupId && gseId) {
      await queryClient.invalidateQueries([
        QueryEnum.RISK_DATA,
        companyIdForQuery,
        riskGroupId,
        gseId,
      ]);
    }
    await refetchExistingRiskData();
  }, [companyId, contextCompanyId, gseId, refetchExistingRiskData, riskGroupId]);

  const handleCancelAnalyze = () => {
    analyzeAbortControllerRef.current?.abort();
    analyzeAbortControllerRef.current = null;
    analyzeRequestIdRef.current += 1;
  };

  const handleAnalyze = async () => {
    if (
      !gseId ||
      !companyId ||
      !routeWorkspaceId ||
      !hasLinkedWorkspace ||
      aiAnalyzeMutation.isPending
    ) {
      return;
    }

    analyzeAbortControllerRef.current?.abort();
    const abortController = new AbortController();
    analyzeAbortControllerRef.current = abortController;
    const requestId = analyzeRequestIdRef.current + 1;
    analyzeRequestIdRef.current = requestId;
    const masterOverrides = buildMasterAiRequestOverrides(isMaster, aiMasterConfig);
    const requestBody = buildGseAiAnalyzeRequestBody({
      userGuidance,
      temporaryDocumentSource,
      customPrompt: masterOverrides.customPrompt,
      model: masterOverrides.model,
    });

    try {
      const result = await aiAnalyzeMutation.mutateAsync({
        companyId,
        workspaceId: routeWorkspaceId,
        gseId,
        ...requestBody,
        signal: abortController.signal,
      });

      if (
        analyzeRequestIdRef.current !== requestId ||
        abortController.signal.aborted
      ) {
        return;
      }

      const incomingNewRisks = result.newRiskSuggestions?.length
        ? result.newRiskSuggestions
        : result.detailedRisks;
      mergeIncomingSuggestions(incomingNewRisks);
      mergeIncomingExistingRiskReviews(result.existingRiskReviews || []);
      markAnalyzed();
      await refreshExistingRisks();
    } catch (error) {
      if (isAiAnalyzeRequestCanceled(error)) return;
      if (getApiErrorCode(error) === GSE_AI_ANALYZE_WORKSPACE_REQUIRED) {
        return;
      }
    } finally {
      if (analyzeAbortControllerRef.current === abortController) {
        analyzeAbortControllerRef.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      analyzeAbortControllerRef.current?.abort();
    };
  }, []);

  const handleAddRisk = async (originalRisk: (typeof newRiskSuggestions)[number]) => {
    if (!riskGroupId || !gseId) return;
    const risk = getCurrentRisk(originalRisk.id) || originalRisk;
    if (existingRiskIds.has(risk.id)) {
      markRiskAdded(risk.id);
      return;
    }
    await upsertRiskDataMutation.mutateAsync(
      buildGseAddRiskPayload({
        gseId,
        companyId,
        workspaceId: routeWorkspaceId,
        riskGroupId,
        risk,
      }),
    );
    markRiskAdded(risk.id);
    setSuggestionExpanded(risk.id, false);
    await refreshExistingRisks();
  };

  const handleApplyModularSuggestion = async (params: {
    review: ExistingRiskReview;
    suggestion: AiRiskFieldSuggestion;
    value: string | number;
  }) => {
    if (!riskGroupId || !gseId) return;
    const riskData =
      existingRiskDataByRiskId.get(params.review.riskId) ||
      sortedExistingRiskData.find((item) => item.id === params.review.riskFactorDataId);
    if (!riskData?.id) return;
    if (params.suggestion.field === 'observation') return;
    if (columnForAiField(params.suggestion.field)) return;

    const suggestionKey = buildModularSuggestionKey(
      params.review.riskId,
      params.suggestion.field,
      params.value,
    );
    if (isEquivalentApplyInFlight(applyingLock.current, suggestionKey)) return;
    applyingLock.current = suggestionKey;
    setApplyingSuggestionKey(suggestionKey);

    try {
    if (
      params.suggestion.field !== 'probability' &&
      riskDataAlreadyContainsFieldValue(params.suggestion.field, params.value, riskData)
    ) {
      markModularSuggestionApplied(suggestionKey);
      return;
    }

    const value = await resolveSuggestionApplyValue({
      intent: params.suggestion.intent,
      value: params.value,
      confirmExistence: (measure) => showConfirmation(existenceConfirmationCopy(measure)),
    });
    if (value == null) return;

    const confirmedKey = buildModularSuggestionKey(
      params.review.riskId,
      params.suggestion.field,
      value,
    );

    if (params.suggestion.field === 'probability') {
      const currentProbability =
        typeof params.suggestion.currentValues === 'number'
          ? params.suggestion.currentValues
          : riskData.probability;
      const confirmed = await showConfirmation({
        title: 'Aplicar probabilidade sugerida?',
        message: `A probabilidade atual (${currentProbability ?? 'não informada'}) será substituída pela sugerida (${value}). Esta ação sobrescreve o valor atual.`,
        confirmText: 'Aplicar probabilidade',
        cancelText: 'Cancelar',
        variant: 'warning',
      });
      if (!confirmed) return;
    }

    const payload = buildModularRiskUpsert({
      field: params.suggestion.field,
      value,
      riskData,
      riskGroupId,
      companyId,
      workspaceId: routeWorkspaceId,
      homogeneousGroupId: gseId,
    });
    if (!payload) return;

      await upsertRiskDataMutation.mutateAsync(payload);
      const refreshed = await refetchExistingRiskData();
      const rows = refreshed.data || [];
      const saved =
        rows.find((item) => item.riskId === params.review.riskId) ||
        rows.find((item) => item.id === params.review.riskFactorDataId);
      if (params.suggestion.field === 'probability') {
        markModularSuggestionApplied(confirmedKey);
      } else if (
        saved &&
        riskDataAlreadyContainsFieldValue(params.suggestion.field, value, saved)
      ) {
        markModularSuggestionApplied(confirmedKey);
      }
    } finally {
      applyingLock.current = null;
      setApplyingSuggestionKey(null);
    }
  };

  if (!gseId) {
    return (
      <Box sx={{ px: 0, pt: isRisksTabDialog ? 1 : 6, pb: 4 }}>
        <SText variant="body1" textAlign="center">
          Salve o GSE antes de executar a Análise de Riscos IA.
        </SText>
      </Box>
    );
  }

  const columnSummaryRiskDataFor = (review: ExistingRiskReview) =>
    existingRiskDataByRiskId.get(review.riskId) ||
    sortedExistingRiskData.find((item) => item.id === review.riskFactorDataId);

  return (
    <Box sx={{ px: 0, pt: isRisksTabDialog ? 1 : 6, pb: isRisksTabDialog ? 2 : 4 }}>
      <SFlex direction="column" gap={isRisksTabDialog ? 3 : 4}>
        {!isRisksTabDialog && (
          <>
            <SText variant="h6" color="text.primary">
              {GSE_WIZARD_TAB_LABELS.AI_ANALYSIS}
            </SText>
            <SText variant="body2" color="text.secondary">
              Sugere fatores de risco e melhorias para este GSE técnico com base no
              nome, descrição, cargos, riscos já vinculados e elementos de origem do
              Assistente. Nada é persistido automaticamente.
            </SText>
          </>
        )}
        {isRisksTabDialog && (
          <SText variant="body2" color="text.secondary">
            Análise global do GSE: informe contexto opcional, execute a IA e revise
            as sugestões nas colunas da tabela (borda tracejada). Nada é gravado
            automaticamente — confirme controles existentes e aceite recomendações
            item a item.
          </SText>
        )}

        {workspaceIds.length === 0 && (
          <Alert severity="warning">{GSE_AI_ANALYZE_NO_WORKSPACE_MESSAGE}</Alert>
        )}

        <AiAnalyzeGuidanceAudioField
          companyId={companyId}
          workspaceId={routeWorkspaceId || ''}
          transcribe={({ audio, fileName }) =>
            transcribeAiAnalyzeGseAudio({
              companyId,
              workspaceId: routeWorkspaceId || workspaceIds[0] || '',
              gseId,
              audio,
              fileName,
            })
          }
          value={userGuidance}
          onChange={setUserGuidance}
          disabled={aiAnalyzeMutation.isPending || !hasLinkedWorkspace}
          onBusyChange={setGuidanceAudioBusy}
          onTranscription={(text) => {
            setUserGuidance((current) => appendTranscribedGuidance(current, text));
          }}
        />

        <AiTemporaryPdfSourceField
          companyId={companyId}
          workspaceId={routeWorkspaceId}
          characterizationId={gseId}
          parsePdf={({ file }) =>
            parseAiTemporarySourceGsePdf({
              companyId,
              workspaceId: routeWorkspaceId || workspaceIds[0] || '',
              gseId,
              file,
            })
          }
          persistHint="Este PDF será usado apenas como contexto desta execução da IA. Ele não será salvo no GSE."
          unsavedMessage="Salve o GSE antes de anexar um PDF temporário."
          showPrivacyAlertsOnlyWhenSelected
          value={temporaryDocumentSource}
          onChange={setTemporaryDocumentSource}
          disabled={aiAnalyzeMutation.isPending || !hasLinkedWorkspace}
        />

        <AiSessionAnalysesPanel
          summary={sessionSummary}
          onViewSummary={
            sessionSummary.hasRecoverableAnalysis
              ? handleViewSessionSummary
              : undefined
          }
          onReturnToTable={
            isRisksTabDialog && onCloseDialog ? onCloseDialog : undefined
          }
        />

        <SFlex direction="row" alignItems="center" gap={1} sx={{ flexWrap: 'wrap' }}>
          <AiActionButtonGroup
            variant="s-button-contained"
            label={
              newRiskSuggestions.length
                ? 'Adicionar mais sugestões com IA'
                : 'Analisar riscos com IA'
            }
            loading={aiAnalyzeMutation.isPending}
            disabled={
              aiAnalyzeMutation.isPending ||
              guidanceAudioBusy ||
              !hasLinkedWorkspace ||
              !routeWorkspaceId
            }
            onExecute={() => void handleAnalyze()}
            onConfigure={() => setAiConfigDialogOpen(true)}
            isMaster={isMaster}
            sButtonProps={{
              color: 'primary',
              buttonProps: { sx: { alignSelf: 'flex-start' } },
            }}
          />
          {aiAnalyzeMutation.isPending && (
            <SButton
              text="Cancelar análise"
              variant="outlined"
              color="primary"
              size="s"
              onClick={handleCancelAnalyze}
              buttonProps={{ sx: { minWidth: 'auto' } }}
            />
          )}
        </SFlex>

        {!isRisksTabDialog && (
          <Box
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              p: 3,
              backgroundColor: 'background.paper',
            }}
          >
            <SText variant="subtitle2" color="text.primary" mb={1}>
              Riscos já caracterizados neste GSE
            </SText>
            <SText variant="body2" color="text.secondary" mb={2}>
              A IA não os adicionará novamente como novos. Riscos só nos elementos
              de origem podem aparecer como candidatos novos.
            </SText>
            {sortedExistingRiskData.length === 0 ? (
              <SText variant="body2" color="text.secondary">
                Nenhum risco vinculado a este GSE neste inventário.
              </SText>
            ) : (
              <SFlex direction="column" gap={1}>
                {sortedExistingRiskData.map((riskData) => (
                  <Accordion
                    key={riskData.id}
                    disableGutters
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:before': { display: 'none' },
                      boxShadow: 'none',
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <SFlex direction="row" alignItems="center" gap={1} sx={{ width: '100%' }}>
                        {riskData.riskFactor?.type && (
                          <SRiskChip
                            type={riskData.riskFactor.type as unknown as RiskTypeEnum}
                          />
                        )}
                        <SText variant="body2">
                          {riskData.riskFactor?.name || 'Risco sem nome'}
                        </SText>
                        <Chip size="small" label="Já caracterizado" variant="outlined" />
                      </SFlex>
                    </AccordionSummary>
                    <AccordionDetails>
                      <SFlex direction="column" gap={0.5}>
                        {typeof riskData.probability === 'number' && (
                          <SText variant="caption" color="text.secondary">
                            <strong>Probabilidade:</strong> {riskData.probability}
                          </SText>
                        )}
                        {summarizeRiskDataLabels(riskData.generateSources) && (
                          <SText variant="caption" color="text.secondary">
                            <strong>Fonte geradora:</strong>{' '}
                            {summarizeRiskDataLabels(riskData.generateSources)}
                          </SText>
                        )}
                      </SFlex>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </SFlex>
            )}
          </Box>
        )}

        {(hasAnalyzed || visibleExistingRiskReviews.length > 0) && (
          <Box
            ref={summarySectionRef}
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              p: 3,
              backgroundColor: 'background.paper',
            }}
          >
            <SFlex direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <SText variant="subtitle2">
                {isRisksTabDialog
                  ? 'Resumo das sugestões'
                  : 'Melhorias sugeridas pela IA'}
              </SText>
              {!isRisksTabDialog && modalExistingRiskReviews.length > 0 && (
                <SFlex direction="row" gap={1}>
                  <SButton
                    text="Expandir todos"
                    variant="outlined"
                    color="primary"
                    size="s"
                    onClick={() => expandAllSuggestions(reviewAccordionIds)}
                    buttonProps={{ sx: { minWidth: 'auto' } }}
                  />
                  <SButton
                    text="Recolher todos"
                    variant="outlined"
                    color="primary"
                    size="s"
                    onClick={() => collapseAllSuggestions(reviewAccordionIds)}
                    buttonProps={{ sx: { minWidth: 'auto' } }}
                  />
                </SFlex>
              )}
            </SFlex>
            <Box sx={{ mb: 1 }}>
              <AiColumnSuggestionsSummary
                reviews={visibleExistingRiskReviews}
                riskDataFor={columnSummaryRiskDataFor}
                appliedKeys={appliedModularSuggestionKeysSet}
                dismissedKeys={dismissedModularSuggestionKeysSet}
              />
            </Box>
            {isRisksTabDialog &&
              hasAnalyzed &&
              visibleExistingRiskReviews.length === 0 &&
              newRiskSuggestions.length === 0 && (
                <SText variant="body2" color="text.secondary" mb={1}>
                  Nenhuma sugestão pertinente foi retornada nesta execução.
                </SText>
              )}
            {isRisksTabDialog && newRiskSuggestions.length > 0 && (
              <Alert severity="info" sx={{ mb: 1 }}>
                {newRiskSuggestions.length === 1
                  ? '1 novo fator de risco foi sugerido. Inclua-o na tabela de Fatores de Riscos (candidato com borda tracejada) ou pela aba Análise de Riscos IA.'
                  : `${newRiskSuggestions.length} novos fatores de risco foram sugeridos. Inclua-os na tabela de Fatores de Riscos (candidatos com borda tracejada) ou pela aba Análise de Riscos IA.`}
              </Alert>
            )}
            {isRisksTabDialog && onCloseDialog && hasAnalyzed && (
              <SFlex direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                <SButton
                  text="Ver sugestões na tabela"
                  variant="contained"
                  color="primary"
                  size="s"
                  onClick={onCloseDialog}
                  buttonProps={{ sx: { minWidth: 'auto' } }}
                />
              </SFlex>
            )}
            {!isRisksTabDialog && modalExistingRiskReviews.length > 0 && (
              <SText variant="body2" color="text.secondary" mb={1}>
                Probabilidade e observação sugeridas para riscos já
                caracterizados. Nada é aplicado automaticamente — escolha item
                a item.
              </SText>
            )}
            {!isRisksTabDialog && visibleExistingRiskReviews.length === 0 ? (
              <SText variant="body2" color="text.secondary">
                Nenhuma melhoria sugerida para riscos já caracterizados nesta
                análise.
              </SText>
            ) : null}
            {!isRisksTabDialog &&
              modalExistingRiskReviews.map((review) => {
                const accordionId = `review:${review.riskId}`;
                return (
                  <AiExistingRiskReviewCard
                    key={accordionId}
                    review={review}
                    expanded={expandedSuggestionIdsSet.has(accordionId)}
                    onExpandedChange={(expanded) =>
                      setSuggestionExpanded(accordionId, expanded)
                    }
                    appliedKeys={appliedModularSuggestionKeysSet}
                    applyingKey={applyingSuggestionKey}
                    riskData={columnSummaryRiskDataFor(review)}
                    onApply={(params) => {
                      void handleApplyModularSuggestion(params);
                    }}
                  />
                );
              })}
          </Box>
        )}

        {!isRisksTabDialog && newRiskSuggestions.length > 0 && (
          <Box
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              p: 3,
              backgroundColor: 'background.paper',
            }}
          >
            <SFlex direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
              <SText variant="subtitle2">Novos riscos sugeridos pela IA</SText>
              <SFlex direction="row" gap={1}>
                <SButton
                  text="Expandir todos"
                  variant="outlined"
                  color="primary"
                  size="s"
                  onClick={() => expandAllSuggestions(newRiskSuggestionIds)}
                  buttonProps={{ sx: { minWidth: 'auto' } }}
                />
                <SButton
                  text="Recolher todos"
                  variant="outlined"
                  color="primary"
                  size="s"
                  onClick={() => collapseAllSuggestions(newRiskSuggestionIds)}
                  buttonProps={{ sx: { minWidth: 'auto' } }}
                />
              </SFlex>
            </SFlex>
            <SText variant="body1" color="text.primary" mb={2}>
              <strong>Detalhes dos Riscos:</strong>
            </SText>
            {newRiskSuggestions.map((originalRisk) => {
              const isAdded = addedRiskIdsSet.has(originalRisk.id);
              const risk = getCurrentRisk(originalRisk.id) || originalRisk;
              return (
                <AiRiskSuggestionCard
                  key={originalRisk.id}
                  risk={risk}
                  isAdded={isAdded}
                  expanded={expandedSuggestionIdsSet.has(risk.id)}
                  onExpandedChange={(expanded) =>
                    setSuggestionExpanded(risk.id, expanded)
                  }
                  onDismiss={() => dismissSuggestion(originalRisk.id)}
                  onAdd={() => {
                    void handleAddRisk(originalRisk);
                  }}
                  edits={suggestionEdits}
                />
              );
            })}
          </Box>
        )}
      </SFlex>

      {isMaster && (
        <SystemAiPromptConfigDialog
          open={aiConfigDialogOpen}
          onClose={() => setAiConfigDialogOpen(false)}
          onApply={setAiMasterConfig}
          initialConfig={aiMasterConfig}
          defaultModelValue="gpt-5-mini"
          title="Configurar Análise de Riscos IA"
          description="Configuração válida apenas para esta sessão. Esta análise usa o GSE técnico já salvo e sugere apenas riscos."
          promptLabel="Prompt personalizado (opcional)"
          showSaveDefault={false}
          showRestoreDefault={false}
          promptMinRows={4}
          promptMaxRows={8}
        />
      )}
    </Box>
  );
};
