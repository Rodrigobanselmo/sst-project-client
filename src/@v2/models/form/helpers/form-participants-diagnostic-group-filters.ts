import type { CombinedHierarchyNestedGroup } from '@v2/models/form/helpers/form-participants-aggregate-by-combined-hierarchy';
import { flattenCombinedHierarchyNestedLeaves } from '@v2/models/form/helpers/form-participants-aggregate-by-combined-hierarchy';
import type { IFormParticipantsFilterSummary } from '@v2/models/form/models/form-participants/form-participants-browse.model';
import { shouldHideFrpsIndicatorData } from '@v2/models/form/helpers/frps-indicators-privacy.util';

export type DiagnosticCapacityFilter =
  | 'all'
  | 'no_diagnosis'
  | 'critical_secrecy'
  | 'no_diagnosis_and_critical_secrecy';

export type AdherenceBandFilter =
  | 'all'
  | 'eq_0'
  | 'gt_0_to_10'
  | 'gt_10_to_20'
  | 'gt_20_to_30'
  | 'gt_30_to_40'
  | 'gt_40_to_50'
  | 'gt_50_to_60'
  | 'gt_60_to_70'
  | 'gt_70_to_80'
  | 'gt_80_to_90'
  | 'gt_90_to_100';

export type DiagnosticGroupMetrics = {
  total: number;
  responded: number;
  notResponded: number;
  responseRatePercent: number;
};

export type RecorteDiagnosticFilterParams = {
  capacity: DiagnosticCapacityFilter;
  adherenceBand: AdherenceBandFilter;
  indicatorsMinParticipants: number;
  isShareableLink: boolean;
};

export const INACTIVE_RECORTE_DIAGNOSTIC_FILTER: RecorteDiagnosticFilterParams = {
  capacity: 'all',
  adherenceBand: 'all',
  indicatorsMinParticipants: 0,
  isShareableLink: false,
};

export const DIAGNOSTIC_CAPACITY_FILTER_OPTIONS: {
  id: DiagnosticCapacityFilter;
  label: string;
}[] = [
  { id: 'all', label: 'Todos' },
  { id: 'no_diagnosis', label: 'Sem diagnóstico' },
  { id: 'critical_secrecy', label: 'Sigilo crítico' },
  {
    id: 'no_diagnosis_and_critical_secrecy',
    label: 'Sem diagnóstico + sigilo crítico',
  },
];

export const ADHERENCE_BAND_FILTER_OPTIONS: {
  id: AdherenceBandFilter;
  label: string;
}[] = [
  { id: 'all', label: 'Todas' },
  { id: 'eq_0', label: '0%' },
  { id: 'gt_0_to_10', label: '>0% a 10%' },
  { id: 'gt_10_to_20', label: '>10% a 20%' },
  { id: 'gt_20_to_30', label: '>20% a 30%' },
  { id: 'gt_30_to_40', label: '>30% a 40%' },
  { id: 'gt_40_to_50', label: '>40% a 50%' },
  { id: 'gt_50_to_60', label: '>50% a 60%' },
  { id: 'gt_60_to_70', label: '>60% a 70%' },
  { id: 'gt_70_to_80', label: '>70% a 80%' },
  { id: 'gt_80_to_90', label: '>80% a 90%' },
  { id: 'gt_90_to_100', label: '>90% a 100%' },
];

const LIST_MODE_FILTER_HINT =
  'Selecione um modo de visualização agrupado para aplicar filtros de capacidade diagnóstica e adesão.';

export const RECORTE_DIAGNOSTIC_FILTERS_LIST_HINT = LIST_MODE_FILTER_HINT;

export const RECORTE_DIAGNOSTIC_FILTER_EVOLUTION_UNAVAILABLE_MESSAGE =
  'Evolução da adesão indisponível para este filtro de grupos. O gráfico considera o recorte estrutural completo.';

export function getDiagnosticCapacityFilterLabel(
  capacity: DiagnosticCapacityFilter,
): string {
  return (
    DIAGNOSTIC_CAPACITY_FILTER_OPTIONS.find((option) => option.id === capacity)
      ?.label ?? capacity
  );
}

export function getAdherenceBandFilterLabel(band: AdherenceBandFilter): string {
  return (
    ADHERENCE_BAND_FILTER_OPTIONS.find((option) => option.id === band)?.label ??
    band
  );
}

export function isRecorteDiagnosticFilterActive(
  params: Pick<RecorteDiagnosticFilterParams, 'capacity' | 'adherenceBand'>,
): boolean {
  return params.capacity !== 'all' || params.adherenceBand !== 'all';
}

export function matchesAdherenceBand(
  responseRatePercent: number,
  band: AdherenceBandFilter,
): boolean {
  switch (band) {
    case 'all':
      return true;
    case 'eq_0':
      return responseRatePercent === 0;
    case 'gt_0_to_10':
      return responseRatePercent > 0 && responseRatePercent <= 10;
    case 'gt_10_to_20':
      return responseRatePercent > 10 && responseRatePercent <= 20;
    case 'gt_20_to_30':
      return responseRatePercent > 20 && responseRatePercent <= 30;
    case 'gt_30_to_40':
      return responseRatePercent > 30 && responseRatePercent <= 40;
    case 'gt_40_to_50':
      return responseRatePercent > 40 && responseRatePercent <= 50;
    case 'gt_50_to_60':
      return responseRatePercent > 50 && responseRatePercent <= 60;
    case 'gt_60_to_70':
      return responseRatePercent > 60 && responseRatePercent <= 70;
    case 'gt_70_to_80':
      return responseRatePercent > 70 && responseRatePercent <= 80;
    case 'gt_80_to_90':
      return responseRatePercent > 80 && responseRatePercent <= 90;
    case 'gt_90_to_100':
      return responseRatePercent > 90 && responseRatePercent <= 100;
    default:
      return true;
  }
}

export function classifyDiagnosticCapacity(params: {
  responded: number;
  indicatorsMinParticipants: number;
  isShareableLink: boolean;
}): {
  isNoDiagnosis: boolean;
  isCriticalSecrecy: boolean;
} {
  const isNoDiagnosis = params.responded === 0;
  const isCriticalSecrecy =
    params.responded > 0 &&
    shouldHideFrpsIndicatorData({
      isShareableLink: params.isShareableLink,
      participantCount: params.responded,
      minParticipants: params.indicatorsMinParticipants,
    });

  return { isNoDiagnosis, isCriticalSecrecy };
}

export function matchesDiagnosticCapacityFilter(
  group: Pick<DiagnosticGroupMetrics, 'responded'>,
  params: RecorteDiagnosticFilterParams,
): boolean {
  const { isNoDiagnosis, isCriticalSecrecy } = classifyDiagnosticCapacity({
    responded: group.responded,
    indicatorsMinParticipants: params.indicatorsMinParticipants,
    isShareableLink: params.isShareableLink,
  });

  switch (params.capacity) {
    case 'all':
      return true;
    case 'no_diagnosis':
      return isNoDiagnosis;
    case 'critical_secrecy':
      return isCriticalSecrecy;
    case 'no_diagnosis_and_critical_secrecy':
      return isNoDiagnosis || isCriticalSecrecy;
    default:
      return true;
  }
}

export function matchesRecorteDiagnosticFilters(
  group: DiagnosticGroupMetrics,
  params: RecorteDiagnosticFilterParams,
): boolean {
  return (
    matchesDiagnosticCapacityFilter(group, params) &&
    matchesAdherenceBand(group.responseRatePercent, params.adherenceBand)
  );
}

export function deriveDiagnosticMetricsFromLeaves(
  leaves: DiagnosticGroupMetrics[],
): DiagnosticGroupMetrics {
  const total = leaves.reduce((sum, leaf) => sum + leaf.total, 0);
  const responded = leaves.reduce((sum, leaf) => sum + leaf.responded, 0);
  const notResponded = Math.max(0, total - responded);
  const responseRatePercent =
    total > 0 ? Math.round((responded / total) * 1000) / 10 : 0;

  return {
    total,
    responded,
    notResponded,
    responseRatePercent,
  };
}

export function deriveDiagnosticSummaryFromLeaves(
  leaves: DiagnosticGroupMetrics[],
): IFormParticipantsFilterSummary {
  const metrics = deriveDiagnosticMetricsFromLeaves(leaves);
  return {
    totalParticipants: metrics.total,
    respondedCount: metrics.responded,
    notRespondedCount: metrics.notResponded,
    responseRatePercent: metrics.responseRatePercent,
  };
}

export function filterFlatDiagnosticGroups<T extends DiagnosticGroupMetrics>(
  groups: T[],
  params: RecorteDiagnosticFilterParams,
): T[] {
  if (!isRecorteDiagnosticFilterActive(params)) return groups;
  return groups.filter((group) => matchesRecorteDiagnosticFilters(group, params));
}

export function filterParentChildDiagnosticGroups<
  TParent extends DiagnosticGroupMetrics,
  TChild extends DiagnosticGroupMetrics,
>(
  parents: TParent[],
  getChildren: (parent: TParent) => TChild[],
  withChildren: (
    parent: TParent,
    children: TChild[],
    metrics: DiagnosticGroupMetrics,
  ) => TParent,
  params: RecorteDiagnosticFilterParams,
): TParent[] {
  if (!isRecorteDiagnosticFilterActive(params)) return parents;

  const result: TParent[] = [];
  for (const parent of parents) {
    const children = getChildren(parent).filter((child) =>
      matchesRecorteDiagnosticFilters(child, params),
    );
    if (children.length === 0) continue;
    result.push(
      withChildren(parent, children, deriveDiagnosticMetricsFromLeaves(children)),
    );
  }
  return result;
}

export function filterCombinedHierarchyDiagnosticGroups(
  groups: CombinedHierarchyNestedGroup[],
  params: RecorteDiagnosticFilterParams,
): CombinedHierarchyNestedGroup[] {
  if (!isRecorteDiagnosticFilterActive(params)) return groups;

  const visit = (
    group: CombinedHierarchyNestedGroup,
  ): CombinedHierarchyNestedGroup | null => {
    const isSelfLeaf =
      group.subgroups.length === 0 && group.leaves.length === 0;

    if (isSelfLeaf) {
      return matchesRecorteDiagnosticFilters(group, params) ? group : null;
    }

    const subgroups = group.subgroups
      .map(visit)
      .filter((item): item is CombinedHierarchyNestedGroup => item != null);
    const leaves = group.leaves.filter((leaf) =>
      matchesRecorteDiagnosticFilters(leaf, params),
    );

    if (subgroups.length === 0 && leaves.length === 0) return null;

    const descendantLeaves = flattenCombinedHierarchyNestedLeaves([
      {
        ...group,
        subgroups,
        leaves,
      },
    ]);

    return {
      ...group,
      subgroups,
      leaves,
      ...deriveDiagnosticMetricsFromLeaves(descendantLeaves),
    };
  };

  return groups
    .map(visit)
    .filter((item): item is CombinedHierarchyNestedGroup => item != null);
}

export function buildDiagnosticFilterPdfNotes(
  params: RecorteDiagnosticFilterParams,
): string[] {
  if (!isRecorteDiagnosticFilterActive(params)) return [];

  const lines: string[] = [];
  if (params.capacity !== 'all') {
    lines.push(
      `Capacidade diagnóstica: ${getDiagnosticCapacityFilterLabel(params.capacity)}`,
    );
  }
  if (params.adherenceBand !== 'all') {
    lines.push(
      `Faixa de adesão: ${getAdherenceBandFilterLabel(params.adherenceBand)}`,
    );
  }
  lines.push(
    `Critério de capacidade diagnóstica: mínimo de ${params.indicatorsMinParticipants} respondentes — Indicadores e Gráficos SimpleSST`,
  );
  lines.push(
    'Este critério refere-se à privacidade de Indicadores e Gráficos e é independente da configuração de Análise de Riscos com IA.',
  );
  return lines;
}
