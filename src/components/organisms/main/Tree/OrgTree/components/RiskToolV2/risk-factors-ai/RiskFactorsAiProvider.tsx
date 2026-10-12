import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Alert, Box, CircularProgress, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SText } from '@v2/components/atoms/SText/SText';
import { useMutateAiAnalyzeCharacterization } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks/useMutateAiAnalyzeCharacterization';
import { updateExistingControlSuggestion } from '@v2/services/security/characterization/characterization/existing-control-suggestion/service/existing-control-suggestion.service';
import type {
  AiRiskFieldSuggestion,
  ExistingRiskReview,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import { isAiAnalyzeRequestCanceled } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/is-ai-analyze-request-canceled.util';
import { useMutateAiAnalyzeGse } from '@v2/services/security/homogeneous-group/ai-analyze-gse/hooks/useMutateAiAnalyzeGse';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { useMutUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';

import { AiExistingRiskReviewCard } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/AiExistingRiskReviewCard';
import {
  buildModularSuggestionKey,
  isEquivalentApplyInFlight,
} from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ai-risk-field-suggestion.util';
import { buildModularRiskUpsert } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/build-modular-risk-upsert.util';
import {
  existenceConfirmationCopy,
  planSuggestionApply,
} from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/suggestion-apply-plan.util';
import {
  CharacterizationAiRiskAnalysisState,
  useCharacterizationAiRiskAnalysisState,
} from 'components/organisms/modals/ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState';
import { getCurrentRiskGroupId } from 'components/organisms/modals/ModalAddCharacterization/utils/get-current-risk-group-id.util';
import { GSE_AI_ANALYZE_NO_WORKSPACE_MESSAGE } from 'components/organisms/modals/ModalAddGHO/gse-ai-analyze.constants';
import { getGseLinkedWorkspaceIds } from 'components/organisms/modals/ModalAddGHO/get-gse-linked-workspace-ids.util';
import { initialAddGhoState } from 'components/organisms/modals/ModalAddGHO/hooks/useAddGho';

import {
  buildAiAnalyzeScopePayload,
  existingControlEmptyMessage,
  filterReviewsForRiskFactorAi,
  RISK_FACTOR_AI_API_FIELD,
  scopedAiEmptyMessage,
  riskDataAlreadyContainsFieldValue,
  RiskFactorAiField,
  RiskFactorAiScopeRequest,
} from './risk-factors-ai-scope.util';

type OpenFieldParams = {
  riskId: string;
  riskName?: string;
  field: RiskFactorAiField;
};

type OpenRiskParams = {
  riskId: string;
  riskName?: string;
};

type RiskFactorsAiContextValue = {
  openField: (params: OpenFieldParams) => void;
  openRisk: (params: OpenRiskParams) => void;
};

const RiskFactorsAiContext = createContext<RiskFactorsAiContextValue | null>(null);

export function useRiskFactorsAiOptional(): RiskFactorsAiContextValue | null {
  return useContext(RiskFactorsAiContext);
}

export type { RiskFactorAiField };

type ScopedPanel = RiskFactorAiScopeRequest & {
  riskName?: string;
  requestId: number;
};

type CharacterizationTarget = {
  kind: 'characterization';
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  riskGroupId?: string;
  analysis: CharacterizationAiRiskAnalysisState;
};

type GseTarget = {
  kind: 'gse';
  companyId: string;
  gseId: string;
  ghoData: typeof initialAddGhoState;
  ghoQuery: IGho;
};

type RiskFactorsAiProviderProps = {
  children: React.ReactNode;
  target: CharacterizationTarget | GseTarget;
  renderGeneral: () => React.ReactNode;
};

const FIELD_TITLE: Record<RiskFactorAiField, string> = {
  generateSource: 'Fonte geradora',
  existingEngineeringMeasures: 'EPC/ENG existente',
  existingAdministrativeMeasures: 'Medida administrativa existente',
  recommendedEngineeringMeasures: 'Recomendação de engenharia',
  recommendedAdministrativeMeasures: 'Recomendação administrativa',
};

export function RiskFactorsAiProvider({
  children,
  target,
  renderGeneral,
}: RiskFactorsAiProviderProps) {
  const requestSeq = useRef(0);
  const [generalOpen, setGeneralOpen] = useState(false);
  const [scoped, setScoped] = useState<ScopedPanel | null>(null);

  const openField = useCallback((params: OpenFieldParams) => {
    requestSeq.current += 1;
    setGeneralOpen(false);
    setScoped({
      scope: 'field',
      riskId: params.riskId,
      field: params.field,
      riskName: params.riskName,
      requestId: requestSeq.current,
    });
  }, []);

  const openRisk = useCallback((params: OpenRiskParams) => {
    requestSeq.current += 1;
    setGeneralOpen(false);
    setScoped({
      scope: 'risk',
      riskId: params.riskId,
      riskName: params.riskName,
      requestId: requestSeq.current,
    });
  }, []);

  const value = useMemo(() => ({ openField, openRisk }), [openField, openRisk]);

  return (
    <RiskFactorsAiContext.Provider value={value}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <SButton
          text="Análise geral com IA"
          variant="outlined"
          color="primary"
          size="s"
          onClick={() => {
            setScoped(null);
            setGeneralOpen(true);
          }}
          buttonProps={{ sx: { minWidth: 'auto' } }}
        />
      </Box>
      {children}
      <Dialog
        open={generalOpen}
        onClose={() => setGeneralOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Análise geral com IA</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '80vh' }}>
          {generalOpen ? renderGeneral() : null}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!scoped}
        onClose={() => setScoped(null)}
        fullWidth
        maxWidth="sm"
      >
        {scoped &&
          (target.kind === 'gse' ? (
            <GseScopedAiDialog
              key={scoped.requestId}
              target={target}
              request={scoped}
              onClose={() => setScoped(null)}
            />
          ) : (
            <ScopedAiDialog
              key={scoped.requestId}
              target={{
                kind: 'characterization',
                companyId: target.companyId,
                workspaceId: target.workspaceId,
                entityId: target.characterizationId,
                riskGroupId: target.riskGroupId,
              }}
              analysis={target.analysis}
              request={scoped}
              onClose={() => setScoped(null)}
            />
          ))}
      </Dialog>
    </RiskFactorsAiContext.Provider>
  );
}

function GseScopedAiDialog({
  target,
  request,
  onClose,
}: {
  target: GseTarget;
  request: ScopedPanel;
  onClose: () => void;
}) {
  const { workspaceId: pageWorkspaceId } = useGetCompanyId();
  const workspaceIds = getGseLinkedWorkspaceIds(target.ghoData, target.ghoQuery);
  const apiWorkspaceId = pageWorkspaceId || workspaceIds[0];
  const sessionWorkspaceId = workspaceIds.slice().sort().join(',') || 'gse';
  const { data: riskGroupData } = useQueryRiskGroupData(target.companyId || undefined);
  const riskGroupId = getCurrentRiskGroupId(riskGroupData);
  const analysis = useCharacterizationAiRiskAnalysisState({
    gseId: target.gseId,
    riskGroupId,
    companyId: target.companyId,
    workspaceId: sessionWorkspaceId,
  });

  return (
    <ScopedAiDialog
      target={{
        kind: 'gse',
        companyId: target.companyId,
        workspaceId: apiWorkspaceId || '',
        entityId: target.gseId,
        riskGroupId,
        missingWorkspace: !apiWorkspaceId || workspaceIds.length === 0,
      }}
      analysis={analysis}
      request={request}
      onClose={onClose}
    />
  );
}

type ScopedRuntimeTarget = {
  kind: 'characterization' | 'gse';
  companyId: string;
  workspaceId: string;
  entityId: string;
  riskGroupId?: string;
  missingWorkspace?: boolean;
};

function ScopedAiDialog({
  target,
  analysis,
  request,
  onClose,
}: {
  target: ScopedRuntimeTarget;
  analysis: CharacterizationAiRiskAnalysisState;
  request: ScopedPanel;
  onClose: () => void;
}) {
  const { showConfirmation } = useConfirmationModal();
  const characterizationAnalyze = useMutateAiAnalyzeCharacterization();
  const gseAnalyze = useMutateAiAnalyzeGse();
  const upsertRiskData = useMutUpsertRiskData();
  const { data: existingRiskData = [], refetch } = useQueryRiskDataByGho(
    target.riskGroupId || '',
    target.entityId,
  );
  const [applyingKey, setApplyingKey] = useState<string | null>(null);
  const applyingLock = useRef<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emptyReason, setEmptyReason] = useState<
    'missing_generate_source' | 'insufficient_context' | 'exhausted' | null
  >(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (target.missingWorkspace || !target.workspaceId) {
      setFinished(true);
      return;
    }
    const abortController = new AbortController();
    const payload = buildAiAnalyzeScopePayload(request);

    const run = async () => {
      try {
        setErrorMessage(null);
        setEmptyReason(null);
        const result =
          target.kind === 'characterization'
            ? await characterizationAnalyze.mutateAsync({
                companyId: target.companyId,
                workspaceId: target.workspaceId,
                characterizationId: target.entityId,
                ...payload,
                signal: abortController.signal,
              })
            : await gseAnalyze.mutateAsync({
                companyId: target.companyId,
                workspaceId: target.workspaceId,
                gseId: target.entityId,
                ...payload,
                signal: abortController.signal,
              });
        if (abortController.signal.aborted) return;
        setEmptyReason(result.emptyReason || null);
        analysis.mergeIncomingExistingRiskReviews(
          filterReviewsForRiskFactorAi(result.existingRiskReviews || [], request),
        );
      } catch (error) {
        if (isAiAnalyzeRequestCanceled(error) || abortController.signal.aborted) return;
        setErrorMessage('Não foi possível concluir a análise deste recorte.');
      } finally {
        if (!abortController.signal.aborted) setFinished(true);
      }
    };

    void run();
    return () => abortController.abort();
    // A abertura do diálogo dispara uma análise. Nova abertura remonta pelo requestId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleReviews = filterReviewsForRiskFactorAi(
    analysis.existingRiskReviews,
    request,
  );
  const title =
    request.scope === 'field'
      ? `IA — ${FIELD_TITLE[request.field]}`
      : 'IA — sugestões deste risco';

  const handleApply = async (params: {
    review: ExistingRiskReview;
    suggestion: AiRiskFieldSuggestion;
    value: string | number;
  }) => {
    if (
      params.suggestion.field === 'probability' ||
      params.suggestion.field === 'observation' ||
      !target.riskGroupId
    ) {
      return;
    }

    const plan = planSuggestionApply({
      intent: params.suggestion.intent,
      value: params.value,
    });
    if (plan.action === 'reject') return;
    const value = plan.value;

    const suggestionKey = buildModularSuggestionKey(
      params.review.riskId,
      params.suggestion.field,
      value,
    );
    if (isEquivalentApplyInFlight(applyingLock.current, suggestionKey)) return;
    applyingLock.current = suggestionKey;
    setApplyingKey(suggestionKey);

    const riskData =
      existingRiskData.find((item) => item.riskId === params.review.riskId) ||
      existingRiskData.find((item) => item.id === params.review.riskFactorDataId);
    if (!riskData?.id) {
      applyingLock.current = null;
      setApplyingKey(null);
      return;
    }

    const alreadyRegistered = riskDataAlreadyContainsFieldValue(
      params.suggestion.field,
      value,
      riskData,
    );
    if (alreadyRegistered) {
      analysis.markModularSuggestionApplied(suggestionKey);
      const apiField = RISK_FACTOR_AI_API_FIELD[params.suggestion.field];
      if (
        params.review.riskFactorDataId &&
        (apiField === 'medidasAdministrativasExistentes' ||
          apiField === 'medidasEngenhariaExistentes')
      ) {
        void updateExistingControlSuggestion({
          companyId: target.companyId,
          workspaceId: target.workspaceId,
          riskFactorDataId: params.review.riskFactorDataId,
          action: 'confirm',
          field: apiField,
          text: String(value),
        }).catch(() => undefined);
      }
      applyingLock.current = null;
      setApplyingKey(null);
      return;
    }

    const payload = buildModularRiskUpsert({
      field: params.suggestion.field,
      value,
      riskData: riskData as IRiskData,
      riskGroupId: target.riskGroupId || '',
      companyId: target.companyId,
      workspaceId: target.workspaceId,
      homogeneousGroupId: target.entityId,
    });
    if (!payload) {
      applyingLock.current = null;
      setApplyingKey(null);
      return;
    }

    if (plan.action === 'needs-confirmation') {
      const confirmed = await showConfirmation(existenceConfirmationCopy(String(value)));
      if (!confirmed) {
        applyingLock.current = null;
        setApplyingKey(null);
        return;
      }
    }

    try {
      await upsertRiskData.mutateAsync(payload);
      const refreshed = await refetch();
      const rows = refreshed.data || [];
      const saved =
        rows.find((item) => item.riskId === params.review.riskId) ||
        rows.find((item) => item.id === params.review.riskFactorDataId);
      if (
        saved &&
        riskDataAlreadyContainsFieldValue(
          params.suggestion.field,
          value,
          saved,
        )
      ) {
        analysis.markModularSuggestionApplied(suggestionKey);
        const apiField = RISK_FACTOR_AI_API_FIELD[params.suggestion.field];
        if (
          params.review.riskFactorDataId &&
          (apiField === 'medidasAdministrativasExistentes' ||
            apiField === 'medidasEngenhariaExistentes')
        ) {
          await updateExistingControlSuggestion({
            companyId: target.companyId,
            workspaceId: target.workspaceId,
            riskFactorDataId: params.review.riskFactorDataId,
            action: 'confirm',
            field: apiField,
            text: String(value),
          }).catch(() => undefined);
        }
      }
    } finally {
      applyingLock.current = null;
      setApplyingKey(null);
    }
  };

  return (
    <>
      <DialogTitle>
        {title}
        {request.riskName ? ` — ${request.riskName}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        {target.missingWorkspace && (
          <Alert severity="info">{GSE_AI_ANALYZE_NO_WORKSPACE_MESSAGE}</Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {errorMessage}
          </Alert>
        )}
        {!finished && !target.missingWorkspace && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={22} />
          </Box>
        )}
        {finished && !visibleReviews.length && !target.missingWorkspace && (
          <SText variant="body2" color="text.secondary">
            {request.scope === 'field' &&
            (request.field === 'existingAdministrativeMeasures' ||
              request.field === 'existingEngineeringMeasures')
              ? existingControlEmptyMessage(emptyReason)
              : scopedAiEmptyMessage(request.scope)}
          </SText>
        )}
        {visibleReviews.map((review) => (
          <Box key={review.riskId} sx={{ mb: 1 }}>
            <AiExistingRiskReviewCard
              review={review}
              expanded
              onExpandedChange={() => undefined}
              appliedKeys={analysis.appliedModularSuggestionKeysSet}
              applyingKey={applyingKey}
              riskData={
                existingRiskData.find((item) => item.riskId === review.riskId) ||
                existingRiskData.find((item) => item.id === review.riskFactorDataId)
              }
              onApply={(params) => {
                void handleApply(params);
              }}
              onDismiss={(params) => {
                analysis.dismissModularSuggestion(
                  buildModularSuggestionKey(
                    params.review.riskId,
                    params.suggestion.field,
                    params.value,
                  ),
                );
                const apiField = RISK_FACTOR_AI_API_FIELD[params.suggestion.field];
                if (
                  params.review.riskFactorDataId &&
                  (apiField === 'medidasAdministrativasExistentes' ||
                    apiField === 'medidasEngenhariaExistentes')
                ) {
                  void updateExistingControlSuggestion({
                    companyId: target.companyId,
                    workspaceId: target.workspaceId,
                    riskFactorDataId: params.review.riskFactorDataId,
                    action: 'dismiss',
                    field: apiField,
                    text: String(params.value),
                  });
                }
              }}
            />
          </Box>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <SButton text="Fechar" variant="shade" size="s" onClick={onClose} />
        </Box>
      </DialogContent>
    </>
  );
}
