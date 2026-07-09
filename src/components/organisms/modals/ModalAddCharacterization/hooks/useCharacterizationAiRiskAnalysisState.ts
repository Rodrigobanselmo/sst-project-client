import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

import { mergeAiRiskSuggestions } from '../components/ModalAiAnalysisContent/merge-ai-risk-suggestions.util';
import {
  AiRiskAnalysisSessionKeyParams,
  AiRiskAnalysisSessionSnapshot,
  buildAiRiskAnalysisSessionKey,
  readAiRiskAnalysisSession,
  writeAiRiskAnalysisSession,
} from '../utils/ai-risk-analysis-session-storage.util';

const createEmptyState = (): AiRiskAnalysisSessionSnapshot => ({
  suggestions: [],
  addedRiskIds: [],
  dismissedRiskIds: [],
  modifiedRisks: {},
  userGuidance: '',
  expandedSuggestionIds: [],
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
  const [expandedSuggestionIds, setExpandedSuggestionIds] = useState<string[]>(
    () => createEmptyState().expandedSuggestionIds,
  );
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionKey) {
      const emptyState = createEmptyState();
      setSuggestions(emptyState.suggestions);
      setAddedRiskIds(emptyState.addedRiskIds);
      setDismissedRiskIds(emptyState.dismissedRiskIds);
      setModifiedRisks(emptyState.modifiedRisks);
      setUserGuidance(emptyState.userGuidance);
      setExpandedSuggestionIds(emptyState.expandedSuggestionIds);
      setHydratedKey(null);
      return;
    }

    if (hydratedKey === sessionKey) return;

    const restored = readAiRiskAnalysisSession(sessionKey) || createEmptyState();
    setSuggestions(restored.suggestions);
    setAddedRiskIds(restored.addedRiskIds);
    setDismissedRiskIds(restored.dismissedRiskIds);
    setModifiedRisks(restored.modifiedRisks);
    setUserGuidance(restored.userGuidance);
    setExpandedSuggestionIds(restored.expandedSuggestionIds);
    setHydratedKey(sessionKey);
  }, [hydratedKey, sessionKey]);

  useEffect(() => {
    if (!sessionKey || hydratedKey !== sessionKey) return;

    writeAiRiskAnalysisSession(sessionKey, {
      suggestions,
      addedRiskIds,
      dismissedRiskIds,
      modifiedRisks,
      userGuidance,
      expandedSuggestionIds,
    });
  }, [
    sessionKey,
    hydratedKey,
    suggestions,
    addedRiskIds,
    dismissedRiskIds,
    modifiedRisks,
    userGuidance,
    expandedSuggestionIds,
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

  const markRiskAdded = useCallback((riskId: string) => {
    setAddedRiskIds((current) =>
      current.includes(riskId) ? current : [...current, riskId],
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

  return {
    suggestions,
    visibleSuggestions,
    addedRiskIds,
    addedRiskIdsSet,
    dismissedRiskIds,
    modifiedRisks,
    setModifiedRisks,
    userGuidance,
    setUserGuidance,
    expandedSuggestionIds,
    expandedSuggestionIdsSet,
    hasVisibleSuggestions,
    mergeIncomingSuggestions,
    markRiskAdded,
    dismissSuggestion,
    setSuggestionExpanded,
    expandAllSuggestions,
    collapseAllSuggestions,
    sessionKey,
  };
};

export type CharacterizationAiRiskAnalysisState = ReturnType<
  typeof useCharacterizationAiRiskAnalysisState
>;
