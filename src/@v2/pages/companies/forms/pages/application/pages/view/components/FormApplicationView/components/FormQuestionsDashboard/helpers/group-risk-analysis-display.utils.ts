import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import type { IFormQuestionsAnswersAnalysisBrowseResultModel } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';

import type { HierarchyGroupForRiskAnalysis } from './expandRiskAnalysisEntitiesForHierarchyGroups';
import { resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback } from './resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback';

function isValidDoneAnalysis(
  item: IFormQuestionsAnswersAnalysisBrowseResultModel,
): boolean {
  return (
    item.status === FormAiAnalysisStatusEnum.DONE && Boolean(item.analysis)
  );
}

function analysisPayloadFingerprint(
  analysis: IFormQuestionsAnswersAnalysisBrowseResultModel['analysis'],
): string {
  if (!analysis) return '';

  const normalizeNames = (
    items: Array<{ nome: string }> | undefined,
  ): string[] =>
    (items ?? [])
      .map((item) => item.nome.trim().toLowerCase())
      .filter(Boolean)
      .sort();

  return JSON.stringify({
    frps: analysis.frps?.trim().toLowerCase() ?? '',
    fontesGeradoras: normalizeNames(analysis.fontesGeradoras),
    medidasEngenhariaRecomendadas: normalizeNames(
      analysis.medidasEngenhariaRecomendadas,
    ),
    medidasAdministrativasRecomendadas: normalizeNames(
      analysis.medidasAdministrativasRecomendadas,
    ),
  });
}

/** Membro usado para TARGET e exibição canônica da análise do agrupamento. */
export function pickCanonicalGroupMemberId(params: {
  memberEntityIds: string[];
  riskId: string;
  results: IFormQuestionsAnswersAnalysisBrowseResultModel[];
}): string {
  const { memberEntityIds, riskId, results } = params;

  const processingMember = memberEntityIds.find((hierarchyId) =>
    results.some(
      (item) =>
        item.riskId === riskId &&
        item.hierarchyId === hierarchyId &&
        item.status === FormAiAnalysisStatusEnum.PROCESSING,
    ),
  );
  if (processingMember) return processingMember;

  const doneMembers = memberEntityIds
    .map((hierarchyId) =>
      results.find(
        (item) =>
          item.riskId === riskId &&
          item.hierarchyId === hierarchyId &&
          isValidDoneAnalysis(item),
      ),
    )
    .filter(
      (item): item is IFormQuestionsAnswersAnalysisBrowseResultModel =>
        item != null,
    )
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  if (doneMembers[0]) {
    return doneMembers[0].hierarchyId;
  }

  return memberEntityIds[0];
}

export function resolveGroupRiskAnalysisDisplay(params: {
  riskId: string;
  memberEntityIds: string[];
  results: IFormQuestionsAnswersAnalysisBrowseResultModel[];
  hierarchyGroups: HierarchyGroupForRiskAnalysis[];
}) {
  const canonicalMemberId = pickCanonicalGroupMemberId({
    memberEntityIds: params.memberEntityIds,
    riskId: params.riskId,
    results: params.results,
  });

  const resolved = resolveAiAnalysisForRiskEntityWithHierarchyGroupFallback({
    riskId: params.riskId,
    entityId: canonicalMemberId,
    results: params.results,
    hierarchyGroups: params.hierarchyGroups,
  });

  const doneFingerprints = new Set(
    params.memberEntityIds
      .map((hierarchyId) =>
        params.results.find(
          (item) =>
            item.riskId === params.riskId &&
            item.hierarchyId === hierarchyId &&
            isValidDoneAnalysis(item),
        ),
      )
      .filter(
        (item): item is IFormQuestionsAnswersAnalysisBrowseResultModel =>
          item != null,
      )
      .map((item) => analysisPayloadFingerprint(item.analysis)),
  );

  const hasMisalignedAnalyses =
    doneFingerprints.size > 1 &&
    Array.from(doneFingerprints).some((fingerprint) => fingerprint !== '');

  return {
    canonicalMemberId,
    resolved,
    hasMisalignedAnalyses,
  };
}

export function isGroupRiskAnalysisProcessing(params: {
  riskId: string;
  memberEntityIds: string[];
  results: IFormQuestionsAnswersAnalysisBrowseResultModel[];
}): boolean {
  return params.memberEntityIds.some((hierarchyId) =>
    params.results.some(
      (item) =>
        item.riskId === params.riskId &&
        item.hierarchyId === hierarchyId &&
        item.status === FormAiAnalysisStatusEnum.PROCESSING,
    ),
  );
}

export function hasGroupRiskAnalysisRecord(params: {
  riskId: string;
  memberEntityIds: string[];
  results: IFormQuestionsAnswersAnalysisBrowseResultModel[];
}): boolean {
  return params.memberEntityIds.some((hierarchyId) =>
    params.results.some(
      (item) =>
        item.riskId === params.riskId &&
        item.hierarchyId === hierarchyId &&
        (item.status === FormAiAnalysisStatusEnum.DONE ||
          item.status === FormAiAnalysisStatusEnum.FAILED ||
          item.status === FormAiAnalysisStatusEnum.PROCESSING),
    ),
  );
}
