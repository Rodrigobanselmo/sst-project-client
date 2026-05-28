import type { IndicatorsNarrativeDiagnosticScope } from '@v2/services/forms/indicators-narrative-diagnostic/service/indicators-narrative-diagnostic.types';

import type { ParticipantGroupForIndicators } from './buildParticipantGroupsForIndicators';

export function buildIndicatorsNarrativeDiagnosticScope(params: {
  selectedGroupingQuestionId: string | null;
  visibleParticipantGroups: ParticipantGroupForIndicators[];
  groupingLabel?: string | null;
  showOnlyGroupIndicators: boolean;
}): IndicatorsNarrativeDiagnosticScope {
  const {
    selectedGroupingQuestionId,
    visibleParticipantGroups,
    groupingLabel,
    showOnlyGroupIndicators,
  } = params;

  if (!selectedGroupingQuestionId) {
    return {
      groupingQuestionId: null,
      participantGroupIds: [],
      groupingLabel: null,
      showOnlyGroupIndicators,
    };
  }

  return {
    groupingQuestionId: selectedGroupingQuestionId,
    participantGroupIds: visibleParticipantGroups.map((g) => g.id),
    groupingLabel: groupingLabel ?? null,
    showOnlyGroupIndicators,
  };
}
