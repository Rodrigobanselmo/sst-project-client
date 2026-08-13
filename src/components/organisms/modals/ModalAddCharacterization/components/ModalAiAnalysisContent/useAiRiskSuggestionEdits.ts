import { useCallback } from 'react';

import type { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

import {
  applyAiRiskSuggestionPatch,
  removeAiRiskMeasureAt,
  replaceAiRiskMeasureAt,
  resolveCurrentAiRisk,
} from './apply-ai-risk-suggestion-patch.util';

type SetModifiedRisks = (
  updater: (prev: Record<string, DetailedRisk>) => Record<string, DetailedRisk>,
) => void;

export function useAiRiskSuggestionEdits(params: {
  visibleSuggestions: DetailedRisk[];
  modifiedRisks: Record<string, DetailedRisk>;
  setModifiedRisks: SetModifiedRisks;
}) {
  const { visibleSuggestions, modifiedRisks, setModifiedRisks } = params;

  const getCurrentRisk = useCallback(
    (riskId: string): DetailedRisk | undefined =>
      resolveCurrentAiRisk(modifiedRisks, visibleSuggestions, riskId),
    [modifiedRisks, visibleSuggestions],
  );

  const patchRisk = useCallback(
    (riskId: string, patch: (risk: DetailedRisk) => DetailedRisk) => {
      setModifiedRisks((prev) =>
        applyAiRiskSuggestionPatch(prev, visibleSuggestions, riskId, patch),
      );
    },
    [setModifiedRisks, visibleSuggestions],
  );

  const editProbability = useCallback(
    (riskId: string, probability: number) => {
      patchRisk(riskId, (risk) => ({ ...risk, probability }));
    },
    [patchRisk],
  );

  const removeGenerateSource = useCallback(
    (riskId: string) => {
      patchRisk(riskId, (risk) => ({ ...risk, generateSource: '' }));
    },
    [patchRisk],
  );

  const editGenerateSource = useCallback(
    (riskId: string, generateSource: string) => {
      patchRisk(riskId, (risk) => ({ ...risk, generateSource }));
    },
    [patchRisk],
  );

  const removeExistingEngineeringMeasure = useCallback(
    (riskId: string, measureIndex: number) => {
      patchRisk(riskId, (risk) => ({
        ...risk,
        existingEngineeringMeasures: removeAiRiskMeasureAt(
          risk.existingEngineeringMeasures,
          measureIndex,
        ),
      }));
    },
    [patchRisk],
  );

  const removeExistingAdministrativeMeasure = useCallback(
    (riskId: string, measureIndex: number) => {
      patchRisk(riskId, (risk) => ({
        ...risk,
        existingAdministrativeMeasures: removeAiRiskMeasureAt(
          risk.existingAdministrativeMeasures,
          measureIndex,
        ),
      }));
    },
    [patchRisk],
  );

  const removeRecommendedEngineeringMeasure = useCallback(
    (riskId: string, measureIndex: number) => {
      patchRisk(riskId, (risk) => ({
        ...risk,
        recommendedEngineeringMeasures: removeAiRiskMeasureAt(
          risk.recommendedEngineeringMeasures,
          measureIndex,
        ),
      }));
    },
    [patchRisk],
  );

  const removeRecommendedAdministrativeMeasure = useCallback(
    (riskId: string, measureIndex: number) => {
      patchRisk(riskId, (risk) => ({
        ...risk,
        recommendedAdministrativeMeasures: removeAiRiskMeasureAt(
          risk.recommendedAdministrativeMeasures,
          measureIndex,
        ),
      }));
    },
    [patchRisk],
  );

  const editExistingEngineeringMeasure = useCallback(
    (riskId: string, measureIndex: number, value: string) => {
      patchRisk(riskId, (risk) => ({
        ...risk,
        existingEngineeringMeasures: replaceAiRiskMeasureAt(
          risk.existingEngineeringMeasures,
          measureIndex,
          value,
        ),
      }));
    },
    [patchRisk],
  );

  const editExistingAdministrativeMeasure = useCallback(
    (riskId: string, measureIndex: number, value: string) => {
      patchRisk(riskId, (risk) => ({
        ...risk,
        existingAdministrativeMeasures: replaceAiRiskMeasureAt(
          risk.existingAdministrativeMeasures,
          measureIndex,
          value,
        ),
      }));
    },
    [patchRisk],
  );

  const editRecommendedEngineeringMeasure = useCallback(
    (riskId: string, measureIndex: number, value: string) => {
      patchRisk(riskId, (risk) => ({
        ...risk,
        recommendedEngineeringMeasures: replaceAiRiskMeasureAt(
          risk.recommendedEngineeringMeasures,
          measureIndex,
          value,
        ),
      }));
    },
    [patchRisk],
  );

  const editRecommendedAdministrativeMeasure = useCallback(
    (riskId: string, measureIndex: number, value: string) => {
      patchRisk(riskId, (risk) => ({
        ...risk,
        recommendedAdministrativeMeasures: replaceAiRiskMeasureAt(
          risk.recommendedAdministrativeMeasures,
          measureIndex,
          value,
        ),
      }));
    },
    [patchRisk],
  );

  return {
    getCurrentRisk,
    editProbability,
    removeGenerateSource,
    editGenerateSource,
    removeExistingEngineeringMeasure,
    removeExistingAdministrativeMeasure,
    removeRecommendedEngineeringMeasure,
    removeRecommendedAdministrativeMeasure,
    editExistingEngineeringMeasure,
    editExistingAdministrativeMeasure,
    editRecommendedEngineeringMeasure,
    editRecommendedAdministrativeMeasure,
  };
}

export type AiRiskSuggestionEdits = ReturnType<typeof useAiRiskSuggestionEdits>;
