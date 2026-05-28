import type { RiskNarrativeDiagnosticScope } from '@v2/services/forms/risk-narrative-diagnostic/service/risk-narrative-diagnostic.types';

import type { ParticipantGroupForIndicators } from './buildParticipantGroupsForIndicators';

/**
 * Monta o scope do diagnóstico narrativo alinhado ao recorte visível da aba
 * (mesma base de buildRiskAnalysisViewContext / PDF).
 */
export function buildRiskNarrativeDiagnosticScope(params: {
  selectedGroupingQuestionId: string | null;
  visibleParticipantGroups: ParticipantGroupForIndicators[];
  allowedEntityIds: Set<string> | null;
  groupingLabel?: string | null;
}): RiskNarrativeDiagnosticScope {
  const { selectedGroupingQuestionId, visibleParticipantGroups, allowedEntityIds, groupingLabel } =
    params;

  if (!selectedGroupingQuestionId) {
    return {
      groupingQuestionId: null,
      participantGroupIds: [],
      allowedHierarchyIds: null,
      groupingLabel: null,
    };
  }

  return {
    groupingQuestionId: selectedGroupingQuestionId,
    participantGroupIds: visibleParticipantGroups.map((g) => g.id),
    allowedHierarchyIds:
      allowedEntityIds && allowedEntityIds.size > 0
        ? Array.from(allowedEntityIds)
        : null,
    groupingLabel: groupingLabel ?? null,
  };
}
