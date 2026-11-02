import { mergeProbabilitySuggestionActions } from './merge-probability-suggestion-actions.util';
import {
  resolveProbabilityAiResult,
  PROBABILITY_AI_GUIDANCE,
  PROBABILITY_AI_MESSAGES,
  isProbabilityOccurrenceRejection,
} from './probability-ai-result.util';
import type { RiskByOccurrenceAiAdapter } from './by-risk-occurrence/risk-by-occurrence-ai-adapter.types';
import { aiAnalyzeHierarchyRisk } from '@v2/services/security/hierarchy/ai-analyze-hierarchy-risk.service';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SText } from '@v2/components/atoms/SText/SText';
import { useMutateAiAnalyzeCharacterization } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/hooks/useMutateAiAnalyzeCharacterization';
import { isAiAnalyzeRequestCanceled } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/is-ai-analyze-request-canceled.util';
import { useMutateAiAnalyzeGse } from '@v2/services/security/homogeneous-group/ai-analyze-gse/hooks/useMutateAiAnalyzeGse';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import type { IRiskData } from 'core/interfaces/api/IRiskData';
import { IGho } from 'core/interfaces/api/IGho';
import { useQueryRiskDataByGho } from 'core/services/hooks/queries/useQueryRiskDataByGho';

import { CharacterizationAiRiskAnalysisState } from 'components/organisms/modals/ModalAddCharacterization/hooks/useCharacterizationAiRiskAnalysisState';
import { GSE_AI_ANALYZE_NO_WORKSPACE_MESSAGE } from 'components/organisms/modals/ModalAddGHO/gse-ai-analyze.constants';
import { getGseLinkedWorkspaceIds } from 'components/organisms/modals/ModalAddGHO/get-gse-linked-workspace-ids.util';
import { initialAddGhoState } from 'components/organisms/modals/ModalAddGHO/hooks/useAddGho';

import {
  columnForAiField,
  RiskFactorAiColumn,
} from './risk-factor-ai-pending.util';
import {
  buildAiAnalyzeScopePayload,
  existingControlEmptyMessage,
  filterReviewsForRiskFactorAi,
  scopedAiEmptyMessage,
  RiskFactorAiField,
  RiskFactorAiScopeRequest,
} from './risk-factors-ai-scope.util';
import {
  RiskFactorAiSuggestionActions,
  useRiskFactorAiSuggestionActions,
} from './useRiskFactorAiSuggestionActions';
import { RiskFactorAiConfigurationDialog } from './RiskFactorAiConfigurationDialog';
import { runCancelableRiskAnalysis } from './run-cancelable-risk-analysis.util';
import {
  canAnalyzeRiskLinkageOccurrence,
  canUseRiskLinkageRow,
  RiskLinkageAiOccurrence,
  filterRiskLinkageOccurrenceReviews,
  RiskFactorAiOccurrenceScope,
} from './risk-linkage-ai-context.util';
import { RiskFactorAiNewRiskCandidates } from './RiskFactorAiNewRiskCandidates';

type OpenFieldParams = {
  riskFactorDataId?: string;
  riskId: string;
  riskName?: string;
  field: RiskFactorAiField;
};

type OpenRiskParams = {
  riskFactorDataId?: string;
  riskId: string;
  riskName?: string;
};

type RiskFactorsAiContextValue = {
  byRiskOccurrence?: RiskByOccurrenceAiAdapter;
  openProbability?: (params: OpenRiskParams) => void;
  occurrenceScope?: RiskFactorAiOccurrenceScope;
  openField: (params: OpenFieldParams) => void;
  openRisk: (params: OpenRiskParams) => void;
  suggestions: RiskFactorAiSuggestionActions;
};

const RiskFactorsAiContext = createContext<RiskFactorsAiContextValue | null>(
  null,
);

export function useRiskFactorsAiOptional(): RiskFactorsAiContextValue | null {
  return useContext(RiskFactorsAiContext);
}

export type { RiskFactorAiField };

type ScopedPanel = RiskFactorAiScopeRequest & {
  riskFactorDataId?: string;
  riskName?: string;
  requestId: number;
  probabilityShortcut?: boolean;
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
  riskGroupId?: string;
  analysis: CharacterizationAiRiskAnalysisState;
} & (
  | { workspaceId: string }
  | { ghoData: typeof initialAddGhoState; ghoQuery: IGho }
);

type HierarchyTarget = {
  kind: 'hierarchy';
  companyId: string;
  workspaceId: string;
  hierarchyId: string;
  hierarchyType: string;
  riskGroupId: string;
  analysis: CharacterizationAiRiskAnalysisState;
};

type RiskFactorsAiProviderProps = {
  children: React.ReactNode;
  target: CharacterizationTarget | GseTarget | HierarchyTarget;
  /** Recebe onClose para o painel fechar o diálogo após o resumo. */
  individualOnly?: boolean;
  occurrenceScope?: RiskFactorAiOccurrenceScope;
  byRiskOccurrence?: RiskByOccurrenceAiAdapter;
  probabilityFallback?: RiskFactorAiSuggestionActions;
  renderGeneral?: (helpers: { onClose: () => void }) => React.ReactNode;
};

const FIELD_TITLE: Record<RiskFactorAiField, string> = {
  generateSource: 'Fonte geradora',
  existingEngineeringMeasures: 'EPC/ENG existente',
  existingAdministrativeMeasures: 'Medida administrativa existente',
  recommendedEngineeringMeasures: 'Recomendação de engenharia',
  recommendedAdministrativeMeasures: 'Recomendação administrativa',
};

const ALL_COLUMNS: RiskFactorAiColumn[] = ['source', 'eng', 'adm', 'rec'];

type ScopedRuntimeTarget = {
  kind: 'characterization' | 'gse' | 'hierarchy';
  hierarchyType?: string;
  companyId: string;
  workspaceId: string;
  entityId: string;
  riskGroupId?: string;
  missingWorkspace?: boolean;
};

export function RiskFactorsAiProvider({
  children,
  target,
  renderGeneral,
  individualOnly = false,
  occurrenceScope,
  byRiskOccurrence,
  probabilityFallback,
}: RiskFactorsAiProviderProps) {
  const requestSeq = useRef(0);
  const [configureRisk, setConfigureRisk] = useState<OpenRiskParams | null>(
    null,
  );
  const [generalOpen, setGeneralOpen] = useState(false);
  const [scoped, setScoped] = useState<ScopedPanel | null>(null);
  const { workspaceId: pageWorkspaceId } = useGetCompanyId();
  const active = useRef(true);
  const scopeRef = useRef(occurrenceScope);
  const byRiskRef = useRef(byRiskOccurrence);
  byRiskRef.current = byRiskOccurrence;
  scopeRef.current = occurrenceScope;
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const canUseOccurrence = useCallback(
    (riskId?: string, occurrenceId?: string) => {
      return (
        active.current &&
        (byRiskRef.current
          ? byRiskRef.current.identity.riskId === riskId &&
            byRiskRef.current.identity.riskFactorDataId === occurrenceId &&
            byRiskRef.current.validate(byRiskRef.current.row)
          : !scopeRef.current ||
            canAnalyzeRiskLinkageOccurrence(
              scopeRef.current,
              riskId,
              occurrenceId,
            ))
      );
    },
    [],
  );
  const validateOccurrence = useCallback(
    (row: Partial<RiskLinkageAiOccurrence>) =>
      canUseOccurrence(row.riskId, row.id) &&
      (byRiskRef.current
        ? byRiskRef.current.validate(row)
        : !scopeRef.current || canUseRiskLinkageRow(scopeRef.current, row)),
    [canUseOccurrence],
  );

  const runtimeTarget: ScopedRuntimeTarget = useMemo(() => {
    if (target.kind === 'hierarchy')
      return {
        kind: 'hierarchy',
        companyId: target.companyId,
        workspaceId: target.workspaceId,
        entityId: target.hierarchyId,
        hierarchyType: target.hierarchyType,
        riskGroupId: target.riskGroupId,
      };
    if (target.kind === 'characterization') {
      return {
        kind: 'characterization',
        companyId: target.companyId,
        workspaceId: target.workspaceId,
        entityId: target.characterizationId,
        riskGroupId: target.riskGroupId,
      };
    }
    if ('workspaceId' in target) {
      return {
        kind: 'gse',
        companyId: target.companyId,
        workspaceId: target.workspaceId,
        entityId: target.gseId,
        riskGroupId: target.riskGroupId,
        missingWorkspace: !target.workspaceId,
      };
    }
    const workspaceIds = getGseLinkedWorkspaceIds(
      target.ghoData,
      target.ghoQuery,
    );
    const apiWorkspaceId = pageWorkspaceId || workspaceIds[0];
    return {
      kind: 'gse',
      companyId: target.companyId,
      workspaceId: apiWorkspaceId || '',
      entityId: target.gseId,
      riskGroupId: target.riskGroupId,
      missingWorkspace: !apiWorkspaceId || workspaceIds.length === 0,
    };
  }, [pageWorkspaceId, target]);

  const primarySuggestions = useRiskFactorAiSuggestionActions({
    analysis: target.analysis,
    companyId: runtimeTarget.companyId,
    apiWorkspaceId: runtimeTarget.workspaceId || undefined,
    riskGroupId: runtimeTarget.riskGroupId,
    entityId: runtimeTarget.entityId,
    validateOccurrence:
      occurrenceScope || byRiskOccurrence ? validateOccurrence : undefined,
    byRiskOccurrence,
  });

  const suggestions = mergeProbabilitySuggestionActions(
    primarySuggestions,
    byRiskOccurrence?.validate(byRiskOccurrence.row) &&
      byRiskOccurrence.canApproveProbability(byRiskOccurrence.row)
      ? probabilityFallback
      : undefined,
  );

  const openField = useCallback(
    (params: OpenFieldParams) => {
      byRiskRef.current?.activate();
      if (!canUseOccurrence(params.riskId, params.riskFactorDataId)) return;
      requestSeq.current += 1;
      setGeneralOpen(false);
      setScoped({
        scope: 'field',
        riskFactorDataId: params.riskFactorDataId,
        riskId: params.riskId,
        field: params.field,
        riskName: params.riskName,
        requestId: requestSeq.current,
      });
    },
    [canUseOccurrence],
  );

  const openRisk = useCallback(
    (params: OpenRiskParams) => {
      byRiskRef.current?.activate();
      if (!canUseOccurrence(params.riskId, params.riskFactorDataId)) return;
      setGeneralOpen(false);
      setScoped(null);
      setConfigureRisk(params);
    },
    [canUseOccurrence],
  );

  useEffect(() => {
    if (!occurrenceScope) return;
    if (
      configureRisk &&
      !canUseOccurrence(configureRisk.riskId, configureRisk.riskFactorDataId)
    )
      setConfigureRisk(null);
    if (scoped && !canUseOccurrence(scoped.riskId, scoped.riskFactorDataId))
      setScoped(null);
  }, [occurrenceScope, configureRisk, scoped, canUseOccurrence]);

  useLayoutEffect(
    () =>
      byRiskOccurrence?.subscribeInactive(() => {
        setConfigureRisk(null);
        setScoped(null);
        setGeneralOpen(false);
      }),
    [byRiskOccurrence],
  );
  const openProbability = useCallback(
    (params: OpenRiskParams) => {
      const adapter = byRiskRef.current;
      if (!adapter || !adapter.canApproveProbability(adapter.row)) return;
      adapter.activate();
      if (!canUseOccurrence(params.riskId, params.riskFactorDataId)) return;
      requestSeq.current++;
      setConfigureRisk(null);
      setScoped({
        ...params,
        scope: 'risk',
        selectedFields: ['probability'],
        probabilityShortcut: true,
        requestId: requestSeq.current,
      });
    },
    [canUseOccurrence],
  );

  const value = useMemo(
    () => ({
      openField,
      openRisk,
      openProbability: byRiskOccurrence ? openProbability : undefined,
      suggestions,
      occurrenceScope,
      byRiskOccurrence,
    }),
    [
      openField,
      openRisk,
      openProbability,
      suggestions,
      occurrenceScope,
      byRiskOccurrence,
    ],
  );

  return (
    <RiskFactorsAiContext.Provider value={value}>
      <Box
        sx={{
          display: byRiskOccurrence ? 'contents' : 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {!individualOnly && (
          <Box
            sx={{
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 1,
            }}
          >
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
        )}
        {!individualOnly && (
          <Box sx={{ flexShrink: 0 }}>
            <RiskFactorAiNewRiskCandidates
              analysis={target.analysis}
              companyId={runtimeTarget.companyId}
              workspaceId={runtimeTarget.workspaceId || undefined}
              entityId={runtimeTarget.entityId}
              riskGroupId={runtimeTarget.riskGroupId}
            />
          </Box>
        )}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: byRiskOccurrence ? 'contents' : 'flex',
            flexDirection: 'column',
            '& > *': byRiskOccurrence
              ? {}
              : {
                  flex: 1,
                  minHeight: 0,
                },
          }}
        >
          {children}
        </Box>
      </Box>
      {configureRisk && (
        <RiskFactorAiConfigurationDialog
          riskName={configureRisk.riskName || configureRisk.riskId}
          target={runtimeTarget}
          onClose={() => setConfigureRisk(null)}
          onGenerate={({ selectedFields, userGuidance }) => {
            if (
              !canUseOccurrence(
                configureRisk.riskId,
                configureRisk.riskFactorDataId,
              )
            )
              return;
            requestSeq.current += 1;
            setScoped({
              scope: 'risk',
              ...configureRisk,
              selectedFields,
              userGuidance,
              requestId: requestSeq.current,
            });
            setConfigureRisk(null);
          }}
        />
      )}
      {!individualOnly && (
        <Dialog
          open={generalOpen}
          onClose={() => setGeneralOpen(false)}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>Análise geral com IA</DialogTitle>
          <DialogContent dividers sx={{ maxHeight: '80vh' }}>
            {generalOpen && renderGeneral
              ? renderGeneral({ onClose: () => setGeneralOpen(false) })
              : null}
          </DialogContent>
        </Dialog>
      )}
      <Dialog
        open={!!scoped}
        onClose={() => setScoped(null)}
        fullWidth
        maxWidth="sm"
      >
        {scoped && (
          <ScopedAiDialog
            key={scoped.requestId}
            target={runtimeTarget}
            analysis={target.analysis}
            suggestions={suggestions}
            request={scoped}
            occurrenceScope={occurrenceScope}
            byRiskOccurrence={byRiskOccurrence}
            canUseOccurrence={canUseOccurrence}
            onClose={() => setScoped(null)}
          />
        )}
      </Dialog>
    </RiskFactorsAiContext.Provider>
  );
}

function ScopedAiDialog({
  target,
  analysis,
  suggestions,
  request,
  occurrenceScope,
  byRiskOccurrence,
  canUseOccurrence,
  onClose,
}: {
  occurrenceScope?: RiskFactorAiOccurrenceScope;
  byRiskOccurrence?: RiskByOccurrenceAiAdapter;
  canUseOccurrence: (riskId?: string, occurrenceId?: string) => boolean;
  target: ScopedRuntimeTarget;
  analysis: CharacterizationAiRiskAnalysisState;
  suggestions: RiskFactorAiSuggestionActions;
  request: ScopedPanel;
  onClose: () => void;
}) {
  const characterizationAnalyze = useMutateAiAnalyzeCharacterization();
  const gseAnalyze = useMutateAiAnalyzeGse();
  const { data: existingRiskData = [] } = useQueryRiskDataByGho(
    target.riskGroupId || '',
    target.entityId,
    { enabled: !byRiskOccurrence },
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emptyReason, setEmptyReason] = useState<
    'missing_generate_source' | 'insufficient_context' | 'exhausted' | null
  >(null);
  const [finished, setFinished] = useState(false);
  const [probabilityResponse, setProbabilityResponse] = useState<{
    metadata?: unknown;
    reviews: Parameters<typeof resolveProbabilityAiResult>[0]['reviews'];
  }>({ reviews: [] });
  const [occurrenceRejected, setOccurrenceRejected] = useState(false);

  useEffect(() => {
    if (
      target.missingWorkspace ||
      !target.workspaceId ||
      !canUseOccurrence(request.riskId, request.riskFactorDataId)
    ) {
      setOccurrenceRejected(true);
      setFinished(true);
      return;
    }
    const abortController = new AbortController();
    const payload = buildAiAnalyzeScopePayload(request);

    const run = async () => {
      try {
        setErrorMessage(null);
        setEmptyReason(null);
        await runCancelableRiskAnalysis(
          abortController.signal,
          () => {
            if (!canUseOccurrence(request.riskId, request.riskFactorDataId))
              return Promise.reject(new Error('Ocorrência indisponível.'));
            if (byRiskOccurrence)
              return byRiskOccurrence.analyze(request, abortController.signal);
            if (target.kind === 'hierarchy')
              return aiAnalyzeHierarchyRisk({
                companyId: target.companyId,
                workspaceId: target.workspaceId,
                hierarchyId: target.entityId,
                hierarchyType: target.hierarchyType!,
                riskGroupId: target.riskGroupId!,
                riskFactorDataId: request.riskFactorDataId!,
                ...payload,
                signal: abortController.signal,
              });
            return target.kind === 'characterization'
              ? characterizationAnalyze.mutateAsync({
                  companyId: target.companyId,
                  workspaceId: target.workspaceId,
                  characterizationId: target.entityId,
                  ...payload,
                  signal: abortController.signal,
                })
              : gseAnalyze.mutateAsync({
                  companyId: target.companyId,
                  workspaceId: target.workspaceId,
                  gseId: target.entityId,
                  ...payload,
                  signal: abortController.signal,
                });
          },
          (result) => {
            if (byRiskOccurrence && !byRiskOccurrence.isResponseCurrent(result))
              return;
            if (!canUseOccurrence(request.riskId, request.riskFactorDataId))
              return;
            setEmptyReason(result.emptyReason || null);
            if (request.probabilityShortcut) {
              setProbabilityResponse({
                metadata: result.metadata?.probabilityAnalysis,
                reviews: result.existingRiskReviews || [],
              });
            }
            analysis.mergeIncomingExistingRiskReviews(
              filterReviewsForRiskFactorAi(
                byRiskOccurrence
                  ? (result.existingRiskReviews || [])
                      .filter(
                        (review) =>
                          review.riskId === byRiskOccurrence.identity.riskId &&
                          review.riskFactorDataId ===
                            byRiskOccurrence.identity.riskFactorDataId,
                      )
                      .map((review) => ({
                        ...review,
                        suggestions: review.suggestions.filter(
                          (suggestion) =>
                            suggestion.field !== 'probability' ||
                            byRiskOccurrence.canApproveProbability(
                              byRiskOccurrence.row,
                            ),
                        ),
                      }))
                  : occurrenceScope
                    ? filterRiskLinkageOccurrenceReviews(
                        result.existingRiskReviews || [],
                        occurrenceScope,
                        request.riskId,
                        request.riskFactorDataId,
                      )
                    : result.existingRiskReviews || [],
                request,
              ),
            );
          },
        );
      } catch (error) {
        if (isAiAnalyzeRequestCanceled(error) || abortController.signal.aborted)
          return;
        if (
          request.probabilityShortcut &&
          isProbabilityOccurrenceRejection(error)
        ) {
          setOccurrenceRejected(true);
        } else {
          setErrorMessage('Não foi possível concluir a análise deste recorte.');
        }
      } finally {
        if (!abortController.signal.aborted) setFinished(true);
      }
    };

    void run();
    return () => abortController.abort();
    // A abertura do diálogo dispara uma análise. Nova abertura remonta pelo requestId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const riskData =
    byRiskOccurrence?.row ||
    existingRiskData.find((item) =>
      occurrenceScope
        ? item.id === request.riskFactorDataId
        : item.riskId === request.riskId,
    );
  const columns =
    request.scope === 'field'
      ? [columnForAiField(request.field)].filter(
          (column): column is RiskFactorAiColumn => !!column,
        )
      : request.selectedFields
        ? Array.from(
            new Set(request.selectedFields.map(columnForAiField)),
          ).filter((column): column is RiskFactorAiColumn => !!column)
        : ALL_COLUMNS;
  const pendingCount = columns.reduce(
    (total, column) =>
      total +
      suggestions
        .pendingFor({ riskId: request.riskId, column, riskData })
        .filter(
          (item) => request.scope !== 'field' || item.field === request.field,
        ).length,
    0,
  );
  const probabilityResult = request.probabilityShortcut
    ? resolveProbabilityAiResult({
        eligible:
          !occurrenceRejected &&
          canUseOccurrence(request.riskId, request.riskFactorDataId) &&
          !!byRiskOccurrence?.canApproveProbability(byRiskOccurrence.row),
        pendingCount,
        riskId: request.riskId,
        riskFactorDataId: request.riskFactorDataId || riskData?.id,
        currentProbability: riskData?.probability,
        ...probabilityResponse,
        appliedKeys:
          analysis.appliedModularSuggestionKeysSet || new Set<string>(),
        dismissedKeys:
          analysis.dismissedModularSuggestionKeysSet || new Set<string>(),
      })
    : null;
  const visiblePendingCount =
    probabilityResult === 'ineligible' ? 0 : pendingCount;
  const title = request.probabilityShortcut
    ? 'IA — estimativa orientativa de probabilidade'
    : request.scope === 'field'
      ? `IA — ${FIELD_TITLE[request.field]}`
      : 'IA — sugestões deste risco';

  return (
    <>
      <DialogTitle>
        {title}
        {request.riskName ? ` — ${request.riskName}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        {request.probabilityShortcut && (
          <Alert severity="info" sx={{ mb: 1 }}>
            {PROBABILITY_AI_GUIDANCE}
          </Alert>
        )}
        {target.missingWorkspace && (
          <Alert severity="info">{GSE_AI_ANALYZE_NO_WORKSPACE_MESSAGE}</Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {errorMessage}
          </Alert>
        )}
        {!finished && !target.missingWorkspace && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              py: 3,
            }}
          >
            <CircularProgress size={22} />
            <SText variant="body2" color="text.secondary">
              Analisando com IA…
            </SText>
          </Box>
        )}
        {finished &&
          !target.missingWorkspace &&
          !errorMessage &&
          visiblePendingCount > 0 && (
            <Alert severity="success">
              {pendingCount === 1
                ? '1 sugestão está disponível na coluna correspondente, com borda tracejada.'
                : `${pendingCount} sugestões estão disponíveis nas colunas correspondentes, com borda tracejada.`}{' '}
              Nada foi gravado: confirme, aceite ou descarte cada item na
              própria coluna.
            </Alert>
          )}
        {finished &&
          !target.missingWorkspace &&
          !errorMessage &&
          (visiblePendingCount === 0 ||
            (probabilityResult && probabilityResult !== 'pending')) && (
            <SText variant="body2" color="text.secondary">
              {probabilityResult && probabilityResult !== 'pending'
                ? PROBABILITY_AI_MESSAGES[probabilityResult]
                : request.scope === 'field' &&
                    (request.field === 'existingAdministrativeMeasures' ||
                      request.field === 'existingEngineeringMeasures')
                  ? existingControlEmptyMessage(emptyReason)
                  : scopedAiEmptyMessage(request.scope)}
            </SText>
          )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <SButton
            text={
              finished && visiblePendingCount > 0 ? 'Ver nas colunas' : 'Fechar'
            }
            variant="shade"
            size="s"
            onClick={onClose}
          />
        </Box>
      </DialogContent>
    </>
  );
}

/** Bind the shared buttons to one validated occurrence, without changing their contracts. */
export function RiskFactorAiOccurrenceBoundary({
  riskData,
  disabled,
  children,
}: {
  riskData?: IRiskData;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const parent = useRiskFactorsAiOptional();
  const value = useMemo(() => {
    if (parent?.byRiskOccurrence) {
      if (disabled || !riskData || !parent.byRiskOccurrence.validate(riskData))
        return null;
      return {
        ...parent,
        openField: (params: OpenFieldParams) =>
          parent.openField({ ...params, riskFactorDataId: riskData.id }),
        openRisk: (params: OpenRiskParams) =>
          parent.openRisk({ ...params, riskFactorDataId: riskData.id }),
        openProbability: parent.openProbability
          ? (params: OpenRiskParams) =>
              parent.openProbability!({
                ...params,
                riskFactorDataId: riskData.id,
              })
          : undefined,
      };
    }
    if (!parent?.occurrenceScope) return parent;
    if (
      disabled ||
      !riskData ||
      !canUseRiskLinkageRow(parent.occurrenceScope, riskData)
    )
      return null;
    return {
      ...parent,
      openField: (params: OpenFieldParams) =>
        parent.openField({ ...params, riskFactorDataId: riskData.id }),
      openRisk: (params: OpenRiskParams) =>
        parent.openRisk({ ...params, riskFactorDataId: riskData.id }),
    };
  }, [parent, riskData, disabled]);
  return (
    <RiskFactorsAiContext.Provider value={value}>
      {children}
    </RiskFactorsAiContext.Provider>
  );
}

/** Explicitly suppress inherited providers for ineligible rows in the by-risk modal. */
export function RiskFactorsAiDisabled({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RiskFactorsAiContext.Provider value={null}>
      {children}
    </RiskFactorsAiContext.Provider>
  );
}
