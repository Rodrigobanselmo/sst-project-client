import {
  ConsolidatedRiskNarrativeFilters,
  ConsolidatedRiskNarrativeGroupingMode,
  ConsolidatedRiskNarrativeScope,
} from './consolidated-view-risk-narrative.types';

const normalizeFilterValue = (value: unknown): string | null => {
  if (value == null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
};

export const normalizeConsolidatedRiskNarrativeScope = (
  scope: Partial<ConsolidatedRiskNarrativeScope> & {
    filters?: Partial<ConsolidatedRiskNarrativeFilters>;
  },
): ConsolidatedRiskNarrativeScope => {
  const groupingMode = (scope.groupingMode?.trim() ||
    'overview') as ConsolidatedRiskNarrativeGroupingMode;

  return {
    groupingMode,
    filters: {
      companyId: normalizeFilterValue(scope.filters?.companyId),
      formApplicationId: normalizeFilterValue(scope.filters?.formApplicationId),
      riskLevel: normalizeFilterValue(scope.filters?.riskLevel),
      status: normalizeFilterValue(scope.filters?.status),
      search: normalizeFilterValue(scope.filters?.search),
    },
  };
};

const buildFiltersPart = (filters: ConsolidatedRiskNarrativeFilters): string => {
  const parts = [
    filters.companyId ? `company:${filters.companyId}` : null,
    filters.formApplicationId ? `app:${filters.formApplicationId}` : null,
    filters.riskLevel ? `nro:${filters.riskLevel}` : null,
    filters.status ? `status:${filters.status}` : null,
    filters.search ? `search:${filters.search}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join('|') : '_all_filters_';
};

export const buildConsolidatedRiskNarrativeScopeKey = (
  scope: ConsolidatedRiskNarrativeScope,
  params: { companyGroupId: number; applicationIds: string[] },
): string => {
  const appsPart = [...new Set(params.applicationIds)].sort().join('|');
  const filtersPart = buildFiltersPart(scope.filters);

  return `consolidated::cg${params.companyGroupId}::apps::${appsPart}::mode::${scope.groupingMode}::filters::${filtersPart}`;
};

export const buildConsolidatedRiskNarrativeScopeFromView = (params: {
  groupingMode: ConsolidatedRiskNarrativeGroupingMode;
  companyFilter: string;
  applicationFilter: string;
  riskLevelFilter: string;
  statusFilter: string;
  search: string;
}): ConsolidatedRiskNarrativeScope =>
  normalizeConsolidatedRiskNarrativeScope({
    groupingMode: params.groupingMode,
    filters: {
      companyId: params.companyFilter || null,
      formApplicationId: params.applicationFilter || null,
      riskLevel: params.riskLevelFilter || null,
      status: params.statusFilter || null,
      search: params.search.trim() || null,
    },
  });
