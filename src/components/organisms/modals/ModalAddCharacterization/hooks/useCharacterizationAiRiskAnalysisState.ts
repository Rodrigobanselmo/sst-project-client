import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

import { mergeAiRiskSuggestions } from '../components/ModalAiAnalysisContent/merge-ai-risk-suggestions.util';

const createEmptyState = () => ({
  suggestions: [] as DetailedRisk[],
  addedRiskIds: [] as string[],
  dismissedRiskIds: [] as string[],
  modifiedRisks: {} as Record<string, DetailedRisk>,
  userGuidance: '',
});

export const useCharacterizationAiRiskAnalysisState = (
  characterizationId?: string,
) => {
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

  const sessionCharacterizationIdRef = useRef<string>('');

  useEffect(() => {
    if (!characterizationId) return;
    if (sessionCharacterizationIdRef.current === characterizationId) return;

    sessionCharacterizationIdRef.current = characterizationId;
    const emptyState = createEmptyState();
    setSuggestions(emptyState.suggestions);
    setAddedRiskIds(emptyState.addedRiskIds);
    setDismissedRiskIds(emptyState.dismissedRiskIds);
    setModifiedRisks(emptyState.modifiedRisks);
    setUserGuidance(emptyState.userGuidance);
  }, [characterizationId]);

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
  };
};

export type CharacterizationAiRiskAnalysisState = ReturnType<
  typeof useCharacterizationAiRiskAnalysisState
>;
