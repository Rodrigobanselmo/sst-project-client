import { ConsolidatedAnalyticsGroupingMode } from '@v2/models/enterprise/company-group/consolidated-view-analytics.helpers';
import { parseShowOnlyGroupIndicators } from '@v2/services/forms/indicators-narrative-diagnostic/service/indicators-narrative-diagnostic.scope';

import { ConsolidatedIndicatorsNarrativeScope } from './consolidated-view-narrative.types';

export const normalizeConsolidatedIndicatorsNarrativeScope = (
  scope: Partial<ConsolidatedIndicatorsNarrativeScope> & {
    showOnlyGroupIndicators?: unknown;
  },
): ConsolidatedIndicatorsNarrativeScope => {
  const groupingMode = (scope.groupingMode?.trim() ||
    'overview') as ConsolidatedAnalyticsGroupingMode;

  const participantGroupIds = Array.from(
    new Set((scope.participantGroupIds ?? []).map((id) => String(id).trim()).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right, 'pt-BR'));

  const showOnlyGroupIndicators = parseShowOnlyGroupIndicators(
    scope.showOnlyGroupIndicators,
  );

  return {
    groupingMode,
    participantGroupIds,
    groupingLabel: scope.groupingLabel?.trim() ? scope.groupingLabel.trim() : null,
    showOnlyGroupIndicators,
  };
};

export const buildConsolidatedIndicatorsNarrativeScopeKey = (
  scope: ConsolidatedIndicatorsNarrativeScope,
  params: { companyGroupId: number; applicationIds: string[] },
): string => {
  const appsPart = [...new Set(params.applicationIds)].sort().join('|');
  const participantGroupIds = scope.participantGroupIds ?? [];
  const groupsPart =
    participantGroupIds.length > 0
      ? participantGroupIds.join('|')
      : '_all_groups_';
  const viewPart = scope.showOnlyGroupIndicators
    ? 'groups_only'
    : 'groups_and_questions';

  return `consolidated::cg${params.companyGroupId}::apps::${appsPart}::mode::${scope.groupingMode}::groups::${groupsPart}::view::${viewPart}`;
};

export const consolidatedNarrativeMatchesViewMode = (
  result: { scope?: ConsolidatedIndicatorsNarrativeScope } | null | undefined,
  showOnlyGroupIndicators: boolean,
) => {
  if (!result?.scope) return false;
  return result.scope.showOnlyGroupIndicators === showOnlyGroupIndicators;
};
