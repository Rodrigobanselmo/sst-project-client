import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  AiTemporaryDocumentSource,
  DetailedRisk,
  ExistingRiskReview,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

import { mergeAiRiskSuggestions } from '../components/ModalAiAnalysisContent/merge-ai-risk-suggestions.util';
import { mergeExistingRiskReviews } from '../components/ModalAiAnalysisContent/ai-risk-field-suggestion.util';
import {
  AiRiskAnalysisSessionKeyParams,
  AiRiskAnalysisSessionSnapshot,
  buildAiRiskAnalysisSessionKey,
  clearAiRiskAnalysisSession,
  readAiRiskAnalysisSession,
  writeAiRiskAnalysisSession,
} from '../utils/ai-risk-analysis-session-storage.util';

const createEmptyState = (): AiRiskAnalysisSessionSnapshot => ({
  suggestions: [],
  existingRiskReviews: [],
  addedRiskIds: [],
  dismissedRiskIds: [],
  modifiedRisks: {},
  userGuidance: '',
  temporaryDocumentSource: null,
  expandedSuggestionIds: [],
  appliedModularSuggestionKeys: [],
  hasAnalyzed: false,
});

export const useCharacterizationAiRiskAnalysisState = (
  params: AiRiskAnalysisSessionKeyParams,
) => {
  const sessionKey = useMemo(
    () =>
      buildAiRiskAnalysisSessionKey({
        characterizationId: params.characterizationId,
        riskGroupId: params.riskGroupId,
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      }),
    [
      params.characterizationId,
      params.riskGroupId,
      params.companyId,
      params.workspaceId,
    ],
  );

  const [suggestions, setSuggestions] = useState<DetailedRisk[]>(
    () => createEmptyState().suggestions,
  );
  const [existingRiskReviews, setExistingRiskReviews] = useState<
    ExistingRiskReview[]
  >(() => createEmptyState().existingRiskReviews);
  const [addedRiskIds, setAddedRiskIds] = useState<string[]>(
    () => createEmptyState().addedRiskIds,
  );
  const [dismissedRiskIds, setDismissedRiskIds] = useState<string[]>(
    () => createEmptyState().dismissedRiskIds,
  );
  const [modifiedRisks, setModifiedRisks] = useState<
    Record<string, DetailedRisk>
  >(() => createEmptyState().modifiedRisks);
  const [userGuidance, setUserGuidance] = useState(
    () => createEmptyState().userGuidance,
  );
  const [temporaryDocumentSource, setTemporaryDocumentSource] =
    useState<AiTemporaryDocumentSource | null>(
      () => createEmptyState().temporaryDocumentSource,
    );
  const [expandedSuggestionIds, setExpandedSuggestionIds] = useState<string[]>(
    () => createEmptyState().expandedSuggestionIds,
  );
  const [appliedModularSuggestionKeys, setAppliedModularSuggestionKeys] =
    useState<string[]>(() => createEmptyState().appliedModularSuggestionKeys);
  const [hasAnalyzed, setHasAnalyzed] = useState(
    () => createEmptyState().hasAnalyzed,
  );
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionKey) {
      const emptyState = createEmptyState();
      setSuggestions(emptyState.suggestions);
      setExistingRiskReviews(emptyState.existingRiskReviews);
      setAddedRiskIds(emptyState.addedRiskIds);
      setDismissedRiskIds(emptyState.dismissedRiskIds);
      setModifiedRisks(emptyState.modifiedRisks);
      setUserGuidance(emptyState.userGuidance);
      setTemporaryDocumentSource(emptyState.temporaryDocumentSource);
      setExpandedSuggestionIds(emptyState.expandedSuggestionIds);
      setAppliedModularSuggestionKeys(emptyState.appliedModularSuggestionKeys);
      setHasAnalyzed(emptyState.hasAnalyzed);
      setHydratedKey(null);
      return;
    }

    if (hydratedKey === sessionKey) return;

    const restored = readAiRiskAnalysisSession(sessionKey) || createEmptyState();
    setSuggestions(restored.suggestions);
    setExistingRiskReviews(restored.existingRiskReviews);
    setAddedRiskIds(restored.addedRiskIds);
    setDismissedRiskIds(restored.dismissedRiskIds);
    setModifiedRisks(restored.modifiedRisks);
    setUserGuidance(restored.userGuidance);
    setTemporaryDocumentSource(restored.temporaryDocumentSource);
    setExpandedSuggestionIds(restored.expandedSuggestionIds);
    setAppliedModularSuggestionKeys(restored.appliedModularSuggestionKeys);
    setHasAnalyzed(restored.hasAnalyzed);
    setHydratedKey(sessionKey);
  }, [hydratedKey, sessionKey]);

  useEffect(() => {
    if (!sessionKey || hydratedKey !== sessionKey) return;

    writeAiRiskAnalysisSession(sessionKey, {
      suggestions,
      existingRiskReviews,
      addedRiskIds,
      dismissedRiskIds,
      modifiedRisks,
      userGuidance,
      temporaryDocumentSource,
      expandedSuggestionIds,
      appliedModularSuggestionKeys,
      hasAnalyzed,
    });
  }, [
    sessionKey,
    hydratedKey,
    suggestions,
    existingRiskReviews,
    addedRiskIds,
    dismissedRiskIds,
    modifiedRisks,
    userGuidance,
    temporaryDocumentSource,
    expandedSuggestionIds,
    appliedModularSuggestionKeys,
    hasAnalyzed,
  ]);

  const visibleSuggestions = useMemo(
    () => suggestions.filter((risk) => !dismissedRiskIds.includes(risk.id)),
    [dismissedRiskIds, suggestions],
  );

  const addedRiskIdsSet = useMemo(
    () => new Set(addedRiskIds),
    [addedRiskIds],
  );

  const expandedSuggestionIdsSet = useMemo(
    () => new Set(expandedSuggestionIds),
    [expandedSuggestionIds],
  );

  const appliedModularSuggestionKeysSet = useMemo(
    () => new Set(appliedModularSuggestionKeys),
    [appliedModularSuggestionKeys],
  );

  const hasVisibleSuggestions = visibleSuggestions.length > 0;

  const dismissedRiskIdsRef = useRef(dismissedRiskIds);
  dismissedRiskIdsRef.current = dismissedRiskIds;

  const mergeIncomingSuggestions = useCallback((incoming: DetailedRisk[]) => {
    setSuggestions((current) =>
      mergeAiRiskSuggestions({
        existing: current,
        incoming,
        dismissedRiskIds: dismissedRiskIdsRef.current,
      }),
    );
  }, []);

  const mergeIncomingExistingRiskReviews = useCallback(
    (incoming: ExistingRiskReview[]) => {
      setExistingRiskReviews((current) =>
        mergeExistingRiskReviews({
          existing: current,
          incoming,
        }),
      );
      setHasAnalyzed(true);
    },
    [],
  );

  const markAnalyzed = useCallback(() => {
    setHasAnalyzed(true);
  }, []);

  /**
   * Keep session-only badges aligned with GSE truth.
   * Removed GSE risks must not keep "Adicionado nesta sessão".
   * Reviews for deleted risks are dropped from session state.
   */
  const reconcileWithExistingRiskIds = useCallback(
    (existingRiskIds: Set<string>) => {
      setAddedRiskIds((current) => {
        const next = current.filter((id) => existingRiskIds.has(id));
        if (
          next.length === current.length &&
          next.every((id, index) => id === current[index])
        ) {
          return current;
        }
        return next;
      });

      setExistingRiskReviews((current) => {
        const next = current.filter((review) =>
          existingRiskIds.has(review.riskId),
        );
        if (next.length === current.length) return current;
        return next;
      });
    },
    [],
  );

  const markRiskAdded = useCallback((riskId: string) => {
    setAddedRiskIds((current) =>
      current.includes(riskId) ? current : [...current, riskId],
    );
  }, []);

  const markModularSuggestionApplied = useCallback((key: string) => {
    setAppliedModularSuggestionKeys((current) =>
      current.includes(key) ? current : [...current, key],
    );
  }, []);

  const dismissSuggestion = useCallback((riskId: string) => {
    setDismissedRiskIds((current) =>
      current.includes(riskId) ? current : [...current, riskId],
    );
    setExpandedSuggestionIds((current) =>
      current.filter((id) => id !== riskId),
    );
  }, []);

  const setSuggestionExpanded = useCallback(
    (riskId: string, isExpanded: boolean) => {
      setExpandedSuggestionIds((current) => {
        if (isExpanded) {
          return current.includes(riskId) ? current : [...current, riskId];
        }
        return current.filter((id) => id !== riskId);
      });
    },
    [],
  );

  const expandAllSuggestions = useCallback((riskIds: string[]) => {
    setExpandedSuggestionIds((current) => {
      const next = new Set(current);
      riskIds.forEach((id) => next.add(id));
      return Array.from(next);
    });
  }, []);

  const collapseAllSuggestions = useCallback((riskIds?: string[]) => {
    if (!riskIds) {
      setExpandedSuggestionIds([]);
      return;
    }
    const idsToCollapse = new Set(riskIds);
    setExpandedSuggestionIds((current) =>
      current.filter((id) => !idsToCollapse.has(id)),
    );
  }, []);

  const clearSessionState = useCallback(() => {
    const emptyState = createEmptyState();
    setSuggestions(emptyState.suggestions);
    setExistingRiskReviews(emptyState.existingRiskReviews);
    setAddedRiskIds(emptyState.addedRiskIds);
    setDismissedRiskIds(emptyState.dismissedRiskIds);
    setModifiedRisks(emptyState.modifiedRisks);
    setUserGuidance(emptyState.userGuidance);
    setTemporaryDocumentSource(emptyState.temporaryDocumentSource);
    setExpandedSuggestionIds(emptyState.expandedSuggestionIds);
    setAppliedModularSuggestionKeys(emptyState.appliedModularSuggestionKeys);
    setHasAnalyzed(emptyState.hasAnalyzed);
    clearAiRiskAnalysisSession(sessionKey);
  }, [sessionKey]);

  return {
    suggestions,
    existingRiskReviews,
    visibleSuggestions,
    addedRiskIds,
    addedRiskIdsSet,
    dismissedRiskIds,
    modifiedRisks,
    setModifiedRisks,
    userGuidance,
    setUserGuidance,
    temporaryDocumentSource,
    setTemporaryDocumentSource,
    expandedSuggestionIds,
    expandedSuggestionIdsSet,
    appliedModularSuggestionKeys,
    appliedModularSuggestionKeysSet,
    hasVisibleSuggestions,
    hasAnalyzed,
    mergeIncomingSuggestions,
    mergeIncomingExistingRiskReviews,
    markAnalyzed,
    reconcileWithExistingRiskIds,
    markRiskAdded,
    markModularSuggestionApplied,
    dismissSuggestion,
    setSuggestionExpanded,
    expandAllSuggestions,
    collapseAllSuggestions,
    clearSessionState,
    sessionKey,
  };
};

export type CharacterizationAiRiskAnalysisState = ReturnType<
  typeof useCharacterizationAiRiskAnalysisState
>;
