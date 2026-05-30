import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import type { IFormQuestionsAnswersAnalysisBrowseResultModel } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';

import type { HierarchyGroupForRiskAnalysis } from './expandRiskAnalysisEntitiesForHierarchyGroups';

export type AiAnalysisResolutionSource = 'own' | 'hierarchy_group_fallback' | 'absent';

export type ResolvedAiAnalysisForRiskEntity = {
  source: AiAnalysisResolutionSource;
  /** Análise cujo conteúdo será exibido (própria ou fallback). */
  analysis: IFormQuestionsAnswersAnalysisBrowseResultModel | null;
  /** Falha própria quando não há fallback válido. */
  failedAnalysis: IFormQuestionsAnswersAnalysisBrowseResultModel | null;
  sourceHierarchyId?: string;
};

function isValidAiAnalysis(
  item: IFormQuestionsAnswersAnalysisBrowseResultModel,
): boolean {
  return (
    item.status === FormAiAnalysisStatusEnum.DONE && Boolean(item.analysis)
  );
}

function findValidAnalysisForPair(
  results: IFormQuestionsAnswersAnalysisBrowseResultModel[],
  riskId: string,
  hierarchyId: string,
): IFormQuestionsAnswersAnalysisBrowseResultModel | null {
  return (
    results.find(
      (item) =>
        item.riskId === riskId &&
        item.hierarchyId === hierarchyId &&
        isValidAiAnalysis(item),
    ) ?? null
  );
}

function findFailedAnalysisForPair(
  results: IFormQuestionsAnswersAnalysisBrowseResultModel[],
  riskId: string,
  hierarchyId: string,
): IFormQuestionsAnswersAnalysisBrowseResultModel | null {
  return (
    results.find(
      (item) =>
        item.riskId === riskId &&
        item.hierarchyId === hierarchyId &&
        item.status === FormAiAnalysisStatusEnum.FAILED,
    ) ?? null
  );
}

/**
 * Resolve análise de IA para um par risco/setor, com fallback no mesmo agrupamento.
 * Registros FAILED não bloqueiam fallback de outro membro do grupo.
 */
export function resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback(params: {
  riskId: string;
  entityId: string;
  results: IFormQuestionsAnswersAnalysisBrowseResultModel[];
  hierarchyGroups: HierarchyGroupForRiskAnalysis[];
}): ResolvedAiAnalysisForRiskEntity {
  const { riskId, entityId, results, hierarchyGroups } = params;

  const ownValid = findValidAnalysisForPair(results, riskId, entityId);
  if (ownValid) {
    return {
      source: 'own',
      analysis: ownValid,
      failedAnalysis: null,
      sourceHierarchyId: entityId,
    };
  }

  const ownFailed = findFailedAnalysisForPair(results, riskId, entityId);

  const group = hierarchyGroups.find((g) => g.hierarchyIds.includes(entityId));
  if (group) {
    const fallbackCandidates = group.hierarchyIds
      .filter((hierarchyId) => hierarchyId !== entityId)
      .map((hierarchyId) =>
        findValidAnalysisForPair(results, riskId, hierarchyId),
      )
      .filter(
        (item): item is IFormQuestionsAnswersAnalysisBrowseResultModel =>
          item != null,
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

    const fallback = fallbackCandidates[0];
    if (fallback) {
      return {
        source: 'hierarchy_group_fallback',
        analysis: fallback,
        failedAnalysis: null,
        sourceHierarchyId: fallback.hierarchyId,
      };
    }
  }

  if (ownFailed) {
    return {
      source: 'absent',
      analysis: null,
      failedAnalysis: ownFailed,
    };
  }

  return {
    source: 'absent',
    analysis: null,
    failedAnalysis: null,
  };
}

/** Adapta análise para ações no setor alvo (inventário), preservando conteúdo de origem. */
export function buildTargetAiAnalysisViewModel(params: {
  resolved: ResolvedAiAnalysisForRiskEntity;
  targetHierarchyId: string;
  targetProbability?: number;
}): IFormQuestionsAnswersAnalysisBrowseResultModel | null {
  const { resolved, targetHierarchyId, targetProbability } = params;
  if (!resolved.analysis) return null;

  const isFallback = resolved.source === 'hierarchy_group_fallback';
  const sourceAnalysisPayload = resolved.analysis.analysis;

  return {
    ...resolved.analysis,
    hierarchyId: targetHierarchyId,
    probability: targetProbability ?? resolved.analysis.probability,
    analysis: sourceAnalysisPayload
      ? {
          ...sourceAnalysisPayload,
          ...(isFallback ? { isAddedAsRiskData: false } : {}),
        }
      : sourceAnalysisPayload,
  };
}
