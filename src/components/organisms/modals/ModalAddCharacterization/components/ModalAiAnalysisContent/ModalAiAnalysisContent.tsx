import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';

import {
  Alert,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { AiActionButtonGroup } from '@v2/components/molecules/AiActionButtonGroup/AiActionButtonGroup';
import { buildMasterAiRequestOverrides } from '@v2/components/molecules/AiActionButtonGroup/build-master-ai-request-overrides.util';
import type { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { SystemAiPromptConfigDialog } from '@v2/components/molecules/SystemAiPromptConfig/SystemAiPromptConfigDialog';

import { useMutateAiAnalyzeCharacterization } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks/useMutateAiAnalyzeCharacterization';
import {
  DetailedRisk,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import { IUseEditCharacterization } from '../../hooks/useEditCharacterization';
import { getCurrentRiskGroupId } from '../../utils/get-current-risk-group-id.util';
import { sortExistingRiskData } from '../../utils/sort-existing-risk-data.util';
import {
  CHARACTERIZATION_AI_ANALYSIS_USES_SAVED_DATA_MESSAGE,
  CHARACTERIZATION_TEXT_INSUFFICIENT_MESSAGE,
  CHARACTERIZATION_UNSAVED_CHANGES_BEFORE_AI_ANALYSIS_MESSAGE,
  isCharacterizationTextInsufficient,
} from './characterization-text-insufficient.util';
import { filterNewAiRiskSuggestions } from './filter-new-ai-risk-suggestions.util';
import {
  buildModularSuggestionKey,
  filterExistingRiskReviews,
  isEquivalentApplyInFlight,
} from './ai-risk-field-suggestion.util';
import { AiExistingRiskReviewCard } from './AiExistingRiskReviewCard';
import { AiRiskSuggestionCard } from './AiRiskSuggestionCard';
import { useAiRiskSuggestionEdits } from './useAiRiskSuggestionEdits';
import { isAiAnalyzeRequestCanceled } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/is-ai-analyze-request-canceled.util';
import { buildModularRiskUpsert } from './build-modular-risk-upsert.util';
import { riskDataAlreadyContainsFieldValue } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/risk-factors-ai-scope.util';
import { AiColumnSuggestionsSummary } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/AiColumnSuggestionsSummary';
import {
  columnForAiField,
  withoutColumnSuggestions,
} from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-factors-ai/risk-factor-ai-pending.util';
import {
  existenceConfirmationCopy,
  resolveSuggestionApplyValue,
} from './suggestion-apply-plan.util';
import { useRiskToolCopyGhoImportFlow } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/hooks/useRiskToolCopyGhoImportFlow';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import {
  AiRiskFieldSuggestion,
  ExistingRiskReview,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { useMutUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { useMutCopyHomo } from 'core/services/hooks/mutations/manager/useMutCopyHomo';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { queryClient } from 'core/services/queryClient';

import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { useAccess } from 'core/hooks/useAccess';
import { AiTemporaryPdfSourceField } from '../AiTemporaryPdfSourceField/AiTemporaryPdfSourceField';
import { AiSessionAnalysesPanel } from '../AiSessionAnalysesPanel/AiSessionAnalysesPanel';
import { summarizeAiSessionAnalysis } from '../../utils/summarize-ai-session-analysis.util';
import { CatalogOnlyCharacterizationPhotosField } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/suggest-catalog-risks-ai/CatalogOnlyCharacterizationPhotosField';
import type { CatalogOnlyTemporaryImage } from 'components/organisms/main/Tree/OrgTree/components/RiskToolV2/suggest-catalog-risks-ai/compress-catalog-only-temp-image.util';
import type { ICharacterizationPhoto } from 'core/interfaces/api/ICharacterization';
import { AiAnalyzeGuidanceAudioField } from './AiAnalyzeGuidanceAudioField';
import { appendTranscribedGuidance } from './append-transcribed-guidance.util';

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

export const ModalAiAnalysisContent = (
  props: IUseEditCharacterization & { onCloseDialog?: () => void },
) => {
  const {
    data: characterizationData,
    hasUnsavedChanges,
    aiRiskAnalysis,
    onCloseDialog,
  } = props;
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
    hasVisibleSuggestions,
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
  const { isMaster } = useAccess();
  const { showConfirmation } = useConfirmationModal();
  const [aiConfigDialogOpen, setAiConfigDialogOpen] = useState(false);
  const [aiMasterConfig, setAiMasterConfig] = useState<SystemAiMasterConfig>({});
  const applyingLock = useRef<string | null>(null);
  const [applyingSuggestionKey, setApplyingSuggestionKey] = useState<
    string | null
  >(null);
  const analyzeAbortControllerRef = useRef<AbortController | null>(null);
  const analyzeRequestIdRef = useRef(0);
  const summarySectionRef = useRef<HTMLDivElement | null>(null);
  const [guidanceAudioBusy, setGuidanceAudioBusy] = useState(false);
  const [selectedExistingPhotoIds, setSelectedExistingPhotoIds] = useState<
    Set<string>
  >(new Set());
  const [temporaryImages, setTemporaryImages] = useState<
    CatalogOnlyTemporaryImage[]
  >([]);
  const [photosHydratedForEntity, setPhotosHydratedForEntity] = useState<
    string | null
  >(null);

  const handleGuidanceTranscription = useCallback((text: string) => {
    setUserGuidance((current) => appendTranscribedGuidance(current, text));
  }, [setUserGuidance]);

  const existingPhotos = useMemo((): ICharacterizationPhoto[] => {
    const charId = characterizationData.id || '';
    return (characterizationData.photos || [])
      .filter(
        (photo): photo is typeof photo & { id: string; photoUrl: string } =>
          Boolean(photo?.id && photo?.photoUrl),
      )
      .map((photo) => ({
        id: photo.id,
        name: photo.name || '',
        companyCharacterizationId: charId,
        photoUrl: photo.photoUrl,
        created_at: photo.updated_at || new Date(),
        updated_at: photo.updated_at || new Date(),
      }));
  }, [characterizationData.id, characterizationData.photos]);

  // Hidrata seleção padrão: todas as fotos cadastradas do elemento.
  useEffect(() => {
    if (!characterizationData.id) return;
    if (photosHydratedForEntity === characterizationData.id) return;
    setSelectedExistingPhotoIds(new Set(existingPhotos.map((photo) => photo.id)));
    setPhotosHydratedForEntity(characterizationData.id);
  }, [
    characterizationData.id,
    existingPhotos,
    photosHydratedForEntity,
  ]);

  const toggleExistingPhoto = useCallback((photoId: string) => {
    setSelectedExistingPhotoIds((current) => {
      const next = new Set(current);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  }, []);

  const hasInsufficientCharacterizationText = useMemo(
    () => isCharacterizationTextInsufficient(characterizationData),
    [characterizationData],
  );

  const aiAnalyzeMutation = useMutateAiAnalyzeCharacterization();
  const upsertRiskDataMutation = useMutUpsertRiskData();
  const copyHomoMutation = useMutCopyHomo();
  const { companyId: contextCompanyId } = useGetCompanyId();
  const { data: riskGroupData } = useQueryRiskGroupData(
    characterizationData.companyId || undefined,
  );
  const riskGroupId = useMemo(
    () => getCurrentRiskGroupId(riskGroupData),
    [riskGroupData],
  );
  const {
    data: existingRiskData = [],
    refetch: refetchExistingRiskData,
    isFetching: isFetchingExistingRiskData,
  } = useQueryRiskDataByGho(riskGroupId || '', characterizationData.id || '');

  const refreshExistingRisksFromGse = useCallback(async () => {
    const companyIdForQuery =
      characterizationData.companyId || contextCompanyId;

    await queryClient.invalidateQueries([
      QueryEnum.RISK_DATA,
      companyIdForQuery,
    ]);

    if (riskGroupId && characterizationData.id) {
      await queryClient.invalidateQueries([
        QueryEnum.RISK_DATA,
        companyIdForQuery,
        riskGroupId,
        characterizationData.id,
      ]);
    }

    await refetchExistingRiskData();
  }, [
    characterizationData.companyId,
    characterizationData.id,
    contextCompanyId,
    refetchExistingRiskData,
    riskGroupId,
  ]);

  const refreshExistingRisksAfterImport = refreshExistingRisksFromGse;

  // Keep GSE list fresh when this panel remounts / characterization changes
  // (e.g. after deletes in Fatores while RISK_DATA cache still looks fresh).
  useEffect(() => {
    if (!riskGroupId || !characterizationData.id) return;
    void refreshExistingRisksFromGse();
    // Intentionally keyed by ids only — avoid refetch loops from callback identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterizationData.id, riskGroupId]);

  const importCopyHomoMutationRef = useRef(copyHomoMutation);
  importCopyHomoMutationRef.current = copyHomoMutation;

  const importCopyHomoMutation = useMemo(
    () =>
      ({
        get isLoading() {
          return importCopyHomoMutationRef.current.isLoading;
        },
        mutateAsync: async (
          variables: Parameters<typeof copyHomoMutation.mutateAsync>[0],
        ) => {
          const result =
            await importCopyHomoMutationRef.current.mutateAsync(variables);
          await refreshExistingRisksAfterImport();
          return result;
        },
      }) as typeof copyHomoMutation,
    [refreshExistingRisksAfterImport],
  );

  const { handleCopyGHO, loadingCopy } = useRiskToolCopyGhoImportFlow(
    riskGroupId || '',
    importCopyHomoMutation,
    {
      defaultWorkspaceId: characterizationData.workspaceId || undefined,
    },
  );

  const canImportRisks = Boolean(characterizationData.id && riskGroupId);

  const handleImportRisks = () => {
    if (!canImportRisks) return;

    handleCopyGHO({
      id: characterizationData.id,
      name: characterizationData.name || 'Caracterização atual',
    } as IGho);
  };

  const sortedExistingRiskData = useMemo(
    () => sortExistingRiskData(existingRiskData),
    [existingRiskData],
  );

  const existingRiskIds = useMemo(
    () =>
      new Set(
        sortedExistingRiskData.map((risk) => risk.riskId).filter(Boolean),
      ),
    [sortedExistingRiskData],
  );

  const existingRiskIdsKey = useMemo(
    () => Array.from(existingRiskIds).sort().join('|'),
    [existingRiskIds],
  );

  const suggestedExistingRiskIds = useMemo(
    () =>
      new Set(
        visibleSuggestions
          .map((risk) => risk.id)
          .filter((riskId) => existingRiskIds.has(riskId)),
      ),
    [existingRiskIds, visibleSuggestions],
  );

  const newRiskSuggestions = useMemo(
    () =>
      filterNewAiRiskSuggestions({
        suggestions: visibleSuggestions,
        existingRiskIds,
        // Only suppress "new" when the risk is still present in GSE.
        addedRiskIds: new Set(
          [...addedRiskIdsSet].filter((id) => existingRiskIds.has(id)),
        ),
      }),
    [addedRiskIdsSet, existingRiskIds, visibleSuggestions],
  );

  const newRiskSuggestionIds = useMemo(
    () => newRiskSuggestions.map((risk) => risk.id),
    [newRiskSuggestions],
  );

  // Session badge / reviews must never invent "already characterized" rows.
  useEffect(() => {
    if (isFetchingExistingRiskData) return;
    reconcileWithExistingRiskIds(existingRiskIds);
    // Prefer stable key over Set identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    existingRiskIdsKey,
    isFetchingExistingRiskData,
    reconcileWithExistingRiskIds,
  ]);

  const visibleExistingRiskReviews = useMemo(
    () =>
      filterExistingRiskReviews({
        reviews: existingRiskReviews.filter((review) =>
          existingRiskIds.has(review.riskId),
        ),
        appliedKeys: appliedModularSuggestionKeysSet,
      }),
    [
      appliedModularSuggestionKeysSet,
      existingRiskIds,
      existingRiskReviews,
    ],
  );

  const modalExistingRiskReviews = useMemo(
    () => withoutColumnSuggestions(visibleExistingRiskReviews),
    [visibleExistingRiskReviews],
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


  const reviewAccordionIds = useMemo(
    () =>
      modalExistingRiskReviews.map(
        (review) => `review:${review.riskId}`,
      ),
    [modalExistingRiskReviews],
  );

  const existingRiskDataByRiskId = useMemo(() => {
    const map = new Map<string, IRiskData>();
    sortedExistingRiskData.forEach((riskData) => {
      if (riskData.riskId) map.set(riskData.riskId, riskData);
    });
    return map;
  }, [sortedExistingRiskData]);

  const handleCancelAnalyze = () => {
    analyzeAbortControllerRef.current?.abort();
    analyzeAbortControllerRef.current = null;
    analyzeRequestIdRef.current += 1;
  };

  const handleAnalyze = async () => {
    if (
      !characterizationData.id ||
      !characterizationData.companyId ||
      !characterizationData.workspaceId ||
      aiAnalyzeMutation.isPending ||
      guidanceAudioBusy
    ) {
      return;
    }

    analyzeAbortControllerRef.current?.abort();
    const abortController = new AbortController();
    analyzeAbortControllerRef.current = abortController;
    const requestId = analyzeRequestIdRef.current + 1;
    analyzeRequestIdRef.current = requestId;

    const masterOverrides = buildMasterAiRequestOverrides(isMaster, aiMasterConfig);

    try {
      const result = await aiAnalyzeMutation.mutateAsync({
        companyId: characterizationData.companyId,
        workspaceId: characterizationData.workspaceId,
        characterizationId: characterizationData.id,
        userGuidance: userGuidance.trim() || undefined,
        temporaryDocumentSources: temporaryDocumentSource
          ? [temporaryDocumentSource]
          : undefined,
        photoSelection: {
          existingPhotoIds: [...selectedExistingPhotoIds],
          temporaryImages: temporaryImages.map((image) => ({
            fileName: image.fileName,
            mimeType: image.mimeType,
            dataUrl: image.dataUrl,
          })),
        },
        customPrompt: masterOverrides.customPrompt,
        model: masterOverrides.model,
        signal: abortController.signal,
      });

      if (
        analyzeRequestIdRef.current !== requestId ||
        abortController.signal.aborted
      ) {
        return;
      }

      const incomingNewRisks =
        result.newRiskSuggestions?.length
          ? result.newRiskSuggestions
          : result.detailedRisks;

      mergeIncomingSuggestions(incomingNewRisks);
      mergeIncomingExistingRiskReviews(result.existingRiskReviews || []);
      markAnalyzed();
      await refreshExistingRisksFromGse();
    } catch (error) {
      // Mutation onError already surfaces non-cancel failures; ignore abort.
      if (isAiAnalyzeRequestCanceled(error)) return;
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

  const handleApplyModularSuggestion = async (params: {
    review: ExistingRiskReview;
    suggestion: AiRiskFieldSuggestion;
    value: string | number;
  }) => {
    if (!riskGroupId || !characterizationData.id) return;

    const riskData =
      existingRiskDataByRiskId.get(params.review.riskId) ||
      sortedExistingRiskData.find(
        (item) => item.id === params.review.riskFactorDataId,
      );

    if (!riskData?.id) {
      console.error('Existing risk data not found for modular apply');
      return;
    }

    if (params.suggestion.field === 'observation') {
      return;
    }

    if (columnForAiField(params.suggestion.field)) {
      return;
    }

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
      companyId: characterizationData.companyId,
      workspaceId: characterizationData.workspaceId,
      homogeneousGroupId: characterizationData.id,
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
    } catch (error) {
      console.error('Error applying modular AI suggestion:', error);
    } finally {
      applyingLock.current = null;
      setApplyingSuggestionKey(null);
    }
  };

  const handleAddRiskAsRiskData = async (originalRisk: DetailedRisk) => {
    try {
      // Use the current (possibly modified) risk data
      const risk = getCurrentRisk(originalRisk.id) || originalRisk;

      if (!riskGroupId) {
        console.error('No risk group found');
        return;
      }

      if (existingRiskIds.has(risk.id)) {
        console.warn('Risk already linked to GSE; skipping create as new');
        markRiskAdded(risk.id);
        return;
      }

      // Use the AI risk data directly since risks are assumed to exist

      // Create the risk data with all the information using AI risk
      await upsertRiskDataMutation.mutateAsync({
        riskFactorGroupDataId: riskGroupId,
        riskId: risk.id,
        homogeneousGroupId: characterizationData.id,
        companyId: characterizationData.companyId,
        workspaceId: characterizationData.workspaceId,
        probability: risk.probability,
        generateSourcesAddOnly: risk.generateSource
          ? [
              {
                name: risk.generateSource,
                companyId: characterizationData.companyId,
              },
            ]
          : [],
        engsAddOnly: risk.existingEngineeringMeasures.map((rec) => ({
          medName: rec,
          medType: MedTypeEnum.ENG,
          companyId: characterizationData.companyId,
        })),
        admsAddOnly: risk.existingAdministrativeMeasures.map((adm) => ({
          medName: adm,
          medType: MedTypeEnum.ADM,
          companyId: characterizationData.companyId,
        })),
        recAddOnly: [
          ...risk.recommendedAdministrativeMeasures
            .map((adm) => adm?.trim())
            .filter((adm): adm is string => !!adm)
            .map((adm) => ({
              recName: adm,
              companyId: characterizationData.companyId,
              recType: RecTypeEnum.ADM,
            })),
          ...risk.recommendedEngineeringMeasures
            .map((rec) => rec?.trim())
            .filter((rec): rec is string => !!rec)
            .map((rec) => ({
              recName: rec,
              recType: RecTypeEnum.ENG,
              companyId: characterizationData.companyId,
            })),
        ],
      });

      // Mark risk as added
      markRiskAdded(risk.id);
      setSuggestionExpanded(risk.id, false);
      console.log('Risk data created successfully with risk:', risk.name);
    } catch (error) {
      console.error('Error creating risk data:', error);
    }
  };

  const isDisabled = !characterizationData.id;

  return (
    <Box sx={{ px: 5, pb: 10 }}>
        <SFlex direction="column" gap={4}>
          <SText variant="h6" color="text.primary">
            Análise IA de Riscos
          </SText>
          <SText variant="body2" color="text.secondary">
            Sugere fatores de risco, fontes geradoras, controles existentes e
            recomendações com base na caracterização já preenchida. Para gerar
            descrição, processos e considerações, use o Assistente IA na aba
            Dados.
          </SText>

          {isDisabled ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                border: '1px solid #ccc',
                borderRadius: 1,
                p: 8,
              }}
            >
              <SText variant="body1" textAlign="center" color="text.secondary">
                Salve a caracterização primeiro para utilizar a análise de IA
              </SText>
            </Box>
          ) : (
            <>
              <Alert severity="info">
                {CHARACTERIZATION_AI_ANALYSIS_USES_SAVED_DATA_MESSAGE}
              </Alert>

              {hasUnsavedChanges && (
                <Alert severity="warning">
                  {CHARACTERIZATION_UNSAVED_CHANGES_BEFORE_AI_ANALYSIS_MESSAGE}
                </Alert>
              )}

              {hasInsufficientCharacterizationText && (
                <Alert severity="warning">
                  {CHARACTERIZATION_TEXT_INSUFFICIENT_MESSAGE}
                </Alert>
              )}

              <CatalogOnlyCharacterizationPhotosField
                existingPhotos={existingPhotos}
                selectedExistingIds={selectedExistingPhotoIds}
                onToggleExisting={toggleExistingPhoto}
                temporaryImages={temporaryImages}
                onTemporaryChange={setTemporaryImages}
                disabled={aiAnalyzeMutation.isPending || guidanceAudioBusy}
              />

              <AiAnalyzeGuidanceAudioField
                companyId={characterizationData.companyId}
                workspaceId={characterizationData.workspaceId}
                characterizationId={characterizationData.id}
                value={userGuidance}
                onChange={setUserGuidance}
                disabled={aiAnalyzeMutation.isPending}
                onBusyChange={setGuidanceAudioBusy}
                onTranscription={handleGuidanceTranscription}
              />

              <AiTemporaryPdfSourceField
                companyId={characterizationData.companyId}
                workspaceId={characterizationData.workspaceId}
                characterizationId={characterizationData.id}
                showPrivacyAlertsOnlyWhenSelected
                value={temporaryDocumentSource}
                onChange={setTemporaryDocumentSource}
                disabled={aiAnalyzeMutation.isPending}
              />

              <AiSessionAnalysesPanel
                summary={sessionSummary}
                onViewSummary={
                  sessionSummary.hasRecoverableAnalysis
                    ? handleViewSessionSummary
                    : undefined
                }
                onReturnToTable={onCloseDialog}
              />

              <SFlex
                direction="row"
                alignItems="center"
                gap={1}
                sx={{ flexWrap: 'wrap' }}
              >
                <AiActionButtonGroup
                  variant="s-button-contained"
                  label={
                    hasVisibleSuggestions
                      ? 'Adicionar mais sugestões com IA'
                      : 'Analisar riscos com IA'
                  }
                  loading={aiAnalyzeMutation.isPending}
                  disabled={
                    aiAnalyzeMutation.isPending || guidanceAudioBusy
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

              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  p: 3,
                  backgroundColor: 'background.paper',
                  mt: 1,
                }}
              >
                <SFlex direction="column" gap={2}>
                  <SFlex
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={2}
                    sx={{ flexWrap: 'wrap' }}
                  >
                    <SText variant="subtitle2" color="text.primary">
                      Riscos já caracterizados no GSE
                    </SText>
                    <SButton
                      text="Importar riscos"
                      variant="outlined"
                      color="primary"
                      size="s"
                      loading={loadingCopy}
                      disabled={!canImportRisks || loadingCopy}
                      onClick={handleImportRisks}
                      buttonProps={{
                        sx: { alignSelf: 'flex-start', minWidth: 'auto' },
                      }}
                    />
                  </SFlex>
                  <SText variant="body2" color="text.secondary">
                    A lista abaixo mostra riscos já vinculados ao GSE. A IA não
                    os adicionará novamente como novos riscos. Use “Importar
                    riscos” para trazer riscos de outra origem antes de rodar a
                    IA.
                  </SText>

                  {!riskGroupId ? (
                    <SText variant="body2" color="text.secondary">
                      Nenhum inventário/grupo de risco disponível para carregar
                      os riscos cadastrados.
                    </SText>
                  ) : sortedExistingRiskData.length === 0 ? (
                    <SText variant="body2" color="text.secondary">
                      Nenhum risco vinculado a este GSE neste inventário.
                    </SText>
                  ) : (
                    <SFlex direction="column" gap={1}>
                      {sortedExistingRiskData.map((riskData: IRiskData) => {
                        const riskName =
                          riskData.riskFactor?.name || 'Risco sem nome';
                        const riskType = riskData.riskFactor?.type;
                        const generateSourcesLabel = summarizeRiskDataLabels(
                          riskData.generateSources,
                        );
                        const controlsLabel = summarizeRiskDataLabels([
                          ...(riskData.engs || []),
                          ...(riskData.adms || []),
                        ]);
                        const recommendationsLabel = summarizeRiskDataLabels(
                          riskData.recs,
                        );
                        const alsoSuggestedByAi = suggestedExistingRiskIds.has(
                          riskData.riskId,
                        );
                        const addedInSession = addedRiskIdsSet.has(
                          riskData.riskId,
                        );

                        return (
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
                              <SFlex
                                direction="row"
                                alignItems="center"
                                gap={2}
                                sx={{ width: '100%', pr: 1 }}
                              >
                                <SFlex
                                  direction="row"
                                  alignItems="center"
                                  gap={1}
                                  sx={{ flex: 1, minWidth: 0 }}
                                >
                                  {riskType && (
                                    <SRiskChip
                                      type={riskType as unknown as RiskTypeEnum}
                                    />
                                  )}
                                  <SText
                                    variant="body2"
                                    color="text.primary"
                                    sx={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {riskName}
                                  </SText>
                                </SFlex>
                                <Chip
                                  size="small"
                                  label="Já caracterizado"
                                  color="default"
                                  variant="outlined"
                                />
                                {addedInSession && (
                                  <Chip
                                    size="small"
                                    label="Adicionado nesta sessão"
                                    color="success"
                                    variant="outlined"
                                  />
                                )}
                              </SFlex>
                            </AccordionSummary>
                            <AccordionDetails>
                              <SFlex direction="column" gap={1}>
                                {alsoSuggestedByAi && (
                                  <Alert severity="info" sx={{ py: 0.5 }}>
                                    A IA também sugeriu este risco, mas ele já
                                    está cadastrado.
                                  </Alert>
                                )}
                                {typeof riskData.probability === 'number' && (
                                  <SText variant="caption" color="text.secondary">
                                    <strong>Probabilidade:</strong>{' '}
                                    {riskData.probability}
                                  </SText>
                                )}
                                {generateSourcesLabel && (
                                  <SText variant="caption" color="text.secondary">
                                    <strong>Fonte geradora:</strong>{' '}
                                    {generateSourcesLabel}
                                  </SText>
                                )}
                                {controlsLabel && (
                                  <SText variant="caption" color="text.secondary">
                                    <strong>Controles existentes:</strong>{' '}
                                    {controlsLabel}
                                  </SText>
                                )}
                                {recommendationsLabel && (
                                  <SText variant="caption" color="text.secondary">
                                    <strong>Recomendações:</strong>{' '}
                                    {recommendationsLabel}
                                  </SText>
                                )}
                                {!generateSourcesLabel &&
                                  !controlsLabel &&
                                  !recommendationsLabel &&
                                  typeof riskData.probability !== 'number' && (
                                    <SText
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Sem detalhes adicionais disponíveis neste
                                      resumo.
                                    </SText>
                                  )}
                              </SFlex>
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                    </SFlex>
                  )}
                </SFlex>
              </Box>

              {(hasAnalyzed || visibleExistingRiskReviews.length > 0) && (
                <Box
                  ref={summarySectionRef}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 3,
                    backgroundColor: 'background.paper',
                    mt: 3,
                  }}
                >
                  <SFlex direction="column" gap={2}>
                    <SFlex
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={2}
                      sx={{ flexWrap: 'wrap' }}
                    >
                      <SText variant="subtitle2" color="text.primary">
                        Melhorias sugeridas pela IA
                      </SText>
                      {modalExistingRiskReviews.length > 0 && (
                        <SFlex direction="row" gap={1}>
                          <SButton
                            text="Expandir todos"
                            variant="outlined"
                            color="primary"
                            size="s"
                            onClick={() =>
                              expandAllSuggestions(reviewAccordionIds)
                            }
                            buttonProps={{ sx: { minWidth: 'auto' } }}
                          />
                          <SButton
                            text="Recolher todos"
                            variant="outlined"
                            color="primary"
                            size="s"
                            onClick={() =>
                              collapseAllSuggestions(reviewAccordionIds)
                            }
                            buttonProps={{ sx: { minWidth: 'auto' } }}
                          />
                        </SFlex>
                      )}
                    </SFlex>
                    <AiColumnSuggestionsSummary
                      reviews={existingRiskReviews.filter((review) =>
                        existingRiskIds.has(review.riskId),
                      )}
                      riskDataFor={(review) =>
                        existingRiskDataByRiskId.get(review.riskId) ||
                        sortedExistingRiskData.find(
                          (item) => item.id === review.riskFactorDataId,
                        )
                      }
                      appliedKeys={appliedModularSuggestionKeysSet}
                      dismissedKeys={dismissedModularSuggestionKeysSet}
                    />
                    {modalExistingRiskReviews.length > 0 && (
                      <SText variant="body2" color="text.secondary">
                        Probabilidade e observação sugeridas para riscos já
                        caracterizados. Nada é aplicado automaticamente —
                        escolha item a item.
                      </SText>
                    )}

                    {visibleExistingRiskReviews.length === 0 ? (
                      <SText variant="body2" color="text.secondary">
                        Nenhuma melhoria sugerida para riscos já caracterizados
                        nesta análise.
                      </SText>
                    ) : (
                      <SFlex direction="column" gap={1}>
                        {modalExistingRiskReviews.map((review) => {
                          const accordionId = `review:${review.riskId}`;
                          return (
                            <AiExistingRiskReviewCard
                              key={accordionId}
                              review={review}
                              expanded={expandedSuggestionIdsSet.has(
                                accordionId,
                              )}
                              onExpandedChange={(isExpanded) =>
                                setSuggestionExpanded(accordionId, isExpanded)
                              }
                              appliedKeys={appliedModularSuggestionKeysSet}
                              applyingKey={applyingSuggestionKey}
                              riskData={
                                existingRiskDataByRiskId.get(review.riskId) ||
                                sortedExistingRiskData.find(
                                  (item) => item.id === review.riskFactorDataId,
                                )
                              }
                              onApply={handleApplyModularSuggestion}
                            />
                          );
                        })}
                      </SFlex>
                    )}
                  </SFlex>
                </Box>
              )}

              {newRiskSuggestions.length > 0 && (
                <Box
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 3,
                    backgroundColor: 'background.paper',
                    mt: 3,
                  }}
                >
                  <SFlex direction="column" gap={3}>
                    <SFlex
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      gap={2}
                      sx={{ flexWrap: 'wrap' }}
                    >
                      <SText variant="subtitle2" color="text.primary">
                        Novos riscos sugeridos pela IA
                      </SText>
                      <SFlex direction="row" gap={1}>
                        <SButton
                          text="Expandir todos"
                          variant="outlined"
                          color="primary"
                          size="s"
                          onClick={() =>
                            expandAllSuggestions(newRiskSuggestionIds)
                          }
                          buttonProps={{ sx: { minWidth: 'auto' } }}
                        />
                        <SButton
                          text="Recolher todos"
                          variant="outlined"
                          color="primary"
                          size="s"
                          onClick={() =>
                            collapseAllSuggestions(newRiskSuggestionIds)
                          }
                          buttonProps={{ sx: { minWidth: 'auto' } }}
                        />
                      </SFlex>
                    </SFlex>

                    {hasInsufficientCharacterizationText && (
                      <Alert severity="warning">
                        {CHARACTERIZATION_TEXT_INSUFFICIENT_MESSAGE}
                      </Alert>
                    )}

                    {/* Detailed Risks */}
                    {newRiskSuggestions.length > 0 && (
                      <Box>
                        <SText variant="body1" color="text.primary" mb={2}>
                          <strong>Detalhes dos Riscos:</strong>
                        </SText>
                        <SFlex direction="column" gap={2}>
                          {newRiskSuggestions.map((originalRisk) => {
                            const isAdded = addedRiskIdsSet.has(originalRisk.id);
                            const risk =
                              getCurrentRisk(originalRisk.id) || originalRisk;
                            return (
                              <AiRiskSuggestionCard
                                key={originalRisk.id}
                                risk={risk}
                                isAdded={isAdded}
                                expanded={expandedSuggestionIdsSet.has(risk.id)}
                                onExpandedChange={(isExpanded) =>
                                  setSuggestionExpanded(risk.id, isExpanded)
                                }
                                onDismiss={() => dismissSuggestion(originalRisk.id)}
                                onAdd={() => {
                                  void handleAddRiskAsRiskData(originalRisk);
                                }}
                                edits={suggestionEdits}
                              />
                            );
                          })}
                        </SFlex>
                      </Box>
                    )}

                    {/* Characterization Info */}
                    <Box
                      sx={{
                        border: '1px solid #f0f0f0',
                        borderRadius: 1,
                        p: 2,
                        backgroundColor: 'grey.50',
                      }}
                    >
                      <SText variant="caption" color="text.secondary">
                        <strong>Caracterização Analisada:</strong>{' '}
                        {characterizationData.name}
                      </SText>
                      <SText
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={0.5}
                      >
                        <strong>Tipo:</strong>{' '}
                        {characterizationData.type}
                      </SText>
                    </Box>
                  </SFlex>
                </Box>
              )}

              {characterizationData.name && (
                <Box
                  sx={{
                    border: '1px solid #f0f0f0',
                    borderRadius: 1,
                    p: 2,
                    backgroundColor: 'grey.50',
                  }}
                >
                  <SText variant="caption" color="text.secondary">
                    <strong>Caracterização:</strong> {characterizationData.name}
                  </SText>
                  {characterizationData.description && (
                    <SText
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mt={1}
                    >
                      <strong>Descrição:</strong>{' '}
                      {characterizationData.description}
                    </SText>
                  )}
                </Box>
              )}
            </>
          )}
        </SFlex>

        {isMaster && (
          <SystemAiPromptConfigDialog
            open={aiConfigDialogOpen}
            onClose={() => setAiConfigDialogOpen(false)}
            onApply={setAiMasterConfig}
            initialConfig={aiMasterConfig}
            defaultModelValue="gpt-5-mini"
            title="Configurar Análise IA de Riscos"
            description="Configuração válida apenas para esta sessão. Esta análise usa a caracterização textual já preenchida e sugere apenas riscos."
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
