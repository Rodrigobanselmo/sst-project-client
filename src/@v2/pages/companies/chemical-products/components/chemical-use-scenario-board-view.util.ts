import type { ChemicalUseScenarioBoardRow } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import {
  formatActivityRiskFactorsListCell,
  formatUseScenarioBoardStatusChip,
  getScenarioActivityRiskFactors,
  isPendingSurveyBoardRow,
  USE_SCENARIO_BOARD_STATUS_LABELS,
} from './chemical-use-scenario-activity-risk.util';

export type UseScenarioBoardViewSortField =
  | 'product'
  | 'riskFactors'
  | 'activity'
  | 'sector'
  | 'exposureGroup'
  | 'frequency'
  | 'duration'
  | 'quantity'
  | 'sourceRows'
  | 'status';

export type UseScenarioBoardViewSort = {
  field: UseScenarioBoardViewSortField;
  order: 'asc' | 'desc';
};

export type UseScenarioBoardViewFilters = {
  search: string;
  product: string;
  riskFactor: string;
  activity: string;
  sector: string;
  exposureGroup: string;
  status: string;
};

export const EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS: UseScenarioBoardViewFilters =
  {
    search: '',
    product: '',
    riskFactor: '',
    activity: '',
    sector: '',
    exposureGroup: '',
    status: '',
  };

export const USE_SCENARIO_BOARD_STATUS_FILTER_OPTIONS = [
  {
    value: 'PENDENTE_DE_LEVANTAMENTO',
    label: USE_SCENARIO_BOARD_STATUS_LABELS.PENDENTE_DE_LEVANTAMENTO,
  },
  {
    value: 'RASCUNHO',
    label: USE_SCENARIO_BOARD_STATUS_LABELS.RASCUNHO,
  },
  {
    value: 'LEVANTAMENTO_EM_ANDAMENTO',
    label: USE_SCENARIO_BOARD_STATUS_LABELS.LEVANTAMENTO_EM_ANDAMENTO,
  },
  {
    value: 'LEVANTAMENTO_CONCLUIDO',
    label: USE_SCENARIO_BOARD_STATUS_LABELS.LEVANTAMENTO_CONCLUIDO,
  },
  {
    value: 'AGUARDANDO_ANALISE_TECNICA',
    label: USE_SCENARIO_BOARD_STATUS_LABELS.AGUARDANDO_ANALISE_TECNICA,
  },
] as const;

export function hasActiveUseScenarioBoardView(
  filters: UseScenarioBoardViewFilters,
  sort: UseScenarioBoardViewSort | null,
): boolean {
  if (sort) return true;
  return Object.values(filters).some((value) => Boolean(value.trim()));
}

function normalize(value: string | null | undefined) {
  return (value || '').trim().toLowerCase();
}

function contains(haystack: string | null | undefined, needle: string) {
  const q = normalize(needle);
  if (!q) return true;
  return normalize(haystack).includes(q);
}

export function formatUseScenarioBoardExposureGroupCell(
  row: Pick<ChemicalUseScenarioBoardRow, 'exposureGroupSnapshot'>,
): string {
  return row.exposureGroupSnapshot?.trim() || '—';
}

export function getUseScenarioBoardStatusFilterValue(
  row: ChemicalUseScenarioBoardRow,
): string {
  if (isPendingSurveyBoardRow(row)) return 'PENDENTE_DE_LEVANTAMENTO';
  return row.presentationStatus || row.surveyStatus || '';
}

function riskFactorsText(row: ChemicalUseScenarioBoardRow) {
  return formatActivityRiskFactorsListCell(
    getScenarioActivityRiskFactors(row),
    row,
  );
}

function frequencyText(row: ChemicalUseScenarioBoardRow) {
  if (row.frequencyCount == null) return '';
  return `${row.frequencyCount} ${row.frequencyPeriod || ''}`.trim();
}

function durationText(row: ChemicalUseScenarioBoardRow) {
  if (row.durationMinutes == null) return '';
  return String(row.durationMinutes);
}

function quantityNumeric(row: ChemicalUseScenarioBoardRow) {
  if (!row.quantity) return null;
  const parsed = Number(String(row.quantity).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function sourceRowsNumeric(row: ChemicalUseScenarioBoardRow) {
  const first = row.sourceRows?.[0];
  return typeof first === 'number' && Number.isFinite(first) ? first : null;
}

function compareNullableNumber(
  left: number | null,
  right: number | null,
  order: 'asc' | 'desc',
) {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  const diff = left - right;
  return order === 'asc' ? diff : -diff;
}

function compareText(
  left: string,
  right: string,
  order: 'asc' | 'desc',
) {
  const result = left.localeCompare(right, 'pt-BR', {
    numeric: true,
    sensitivity: 'base',
  });
  return order === 'asc' ? result : -result;
}

export function rowMatchesUseScenarioBoardFilters(
  row: ChemicalUseScenarioBoardRow,
  filters: UseScenarioBoardViewFilters,
): boolean {
  if (filters.status) {
    if (getUseScenarioBoardStatusFilterValue(row) !== filters.status) {
      return false;
    }
  }
  if (!contains(row.product?.tradeName, filters.product)) return false;
  if (!contains(riskFactorsText(row), filters.riskFactor)) return false;
  if (!contains(row.activityName, filters.activity)) return false;
  if (!contains(row.sectorSnapshot, filters.sector)) return false;
  if (!contains(row.exposureGroupSnapshot, filters.exposureGroup)) return false;

  const search = filters.search;
  if (!normalize(search)) return true;
  const haystack = [
    row.product?.tradeName,
    row.product?.manufacturer,
    row.activityName,
    row.sectorSnapshot,
    row.exposureGroupSnapshot,
    row.sourceProductLabel,
    riskFactorsText(row),
    formatUseScenarioBoardStatusChip(row),
  ].join(' ');
  return contains(haystack, search);
}

export function compareUseScenarioBoardRows(
  left: ChemicalUseScenarioBoardRow,
  right: ChemicalUseScenarioBoardRow,
  sort: UseScenarioBoardViewSort,
): number {
  const { field, order } = sort;
  switch (field) {
    case 'product':
      return compareText(
        left.product?.tradeName || '',
        right.product?.tradeName || '',
        order,
      );
    case 'riskFactors':
      return compareText(riskFactorsText(left), riskFactorsText(right), order);
    case 'activity':
      return compareText(left.activityName || '', right.activityName || '', order);
    case 'sector':
      return compareText(
        left.sectorSnapshot || '',
        right.sectorSnapshot || '',
        order,
      );
    case 'exposureGroup':
      return compareText(
        left.exposureGroupSnapshot || '',
        right.exposureGroupSnapshot || '',
        order,
      );
    case 'frequency': {
      const byCount = compareNullableNumber(
        left.frequencyCount,
        right.frequencyCount,
        order,
      );
      if (byCount !== 0) return byCount;
      return compareText(
        left.frequencyPeriod || '',
        right.frequencyPeriod || '',
        order,
      );
    }
    case 'duration':
      return compareNullableNumber(
        left.durationMinutes,
        right.durationMinutes,
        order,
      );
    case 'quantity':
      return compareNullableNumber(
        quantityNumeric(left),
        quantityNumeric(right),
        order,
      );
    case 'sourceRows':
      return compareNullableNumber(
        sourceRowsNumeric(left),
        sourceRowsNumeric(right),
        order,
      );
    case 'status':
      return compareText(
        formatUseScenarioBoardStatusChip(left),
        formatUseScenarioBoardStatusChip(right),
        order,
      );
    default:
      return 0;
  }
}

export function nextUseScenarioBoardSort(
  current: UseScenarioBoardViewSort | null,
  field: UseScenarioBoardViewSortField,
): UseScenarioBoardViewSort | null {
  if (!current || current.field !== field) {
    return { field, order: 'asc' };
  }
  if (current.order === 'asc') return { field, order: 'desc' };
  return null;
}

/**
 * Presentation-only recorte: filters then optional sort.
 * Does not mutate `rows`, group, or dedupe. Future PDF should consume this.
 */
export function applyUseScenarioBoardView(
  rows: ChemicalUseScenarioBoardRow[],
  params: {
    filters?: UseScenarioBoardViewFilters;
    sort?: UseScenarioBoardViewSort | null;
  } = {},
): ChemicalUseScenarioBoardRow[] {
  const filters = params.filters || EMPTY_USE_SCENARIO_BOARD_VIEW_FILTERS;
  const filtered = rows.filter((row) =>
    rowMatchesUseScenarioBoardFilters(row, filters),
  );
  if (!params.sort) return filtered;

  return filtered
    .map((row, index) => ({ row, index }))
    .sort((left, right) => {
      const compared = compareUseScenarioBoardRows(
        left.row,
        right.row,
        params.sort!,
      );
      return compared !== 0 ? compared : left.index - right.index;
    })
    .map((item) => item.row);
}
