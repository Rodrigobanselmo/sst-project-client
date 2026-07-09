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
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionKey) {
      const emptyState = createEmptyState();
      setSuggestions(emptyState.suggestions);
      setAddedRiskIds(emptyState.addedRiskIds);
      setDismissedRiskIds(emptyState.dismissedRiskIds);
      setModifiedRisks(emptyState.modifiedRisks);
      setUserGuidance(emptyState.userGuidance);
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
    });
  }, [
    sessionKey,
    hydratedKey,
    suggestions,
    addedRiskIds,
    dismissedRiskIds,
    modifiedRisks,
    userGuidance,
  ]);

  const visibleSuggestions = useMemo(
    () => suggestions.filter((risk) => !dismissedRiskIds.includes(risk.id)),
    [dismissedRiskIds, suggestions],
  );

  const addedRiskIdsSet = useMemo(
    () => new Set(addedRiskIds),
    [addedRiskIds],
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
    hasVisibleSuggestions,
    mergeIncomingSuggestions,
    markRiskAdded,
    dismissSuggestion,
    sessionKey,
  };
};

export type CharacterizationAiRiskAnalysisState = ReturnType<
  typeof useCharacterizationAiRiskAnalysisState
>;
