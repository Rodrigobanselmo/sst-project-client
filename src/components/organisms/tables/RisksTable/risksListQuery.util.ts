import { FilterFieldEnum } from 'components/atoms/STable/components/STableFilter/constants/filter.map';
import type { IFilterTableData } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';

import type { StoredRiskRegisteredSort } from './registeredRisksTable.storage';
import type { RiskRegisteredListSortBy } from './registeredRisksTable.types';

export type RiskStatusFilter = 'ACTIVE' | 'INACTIVE' | 'ALL';

export type RisksListUrlState = {
  search: string;
  page: number;
  pageSize: number | null;
  status: RiskStatusFilter;
  riskTypes: string[];
  severities: number[];
  riskSubTypeIds: number[];
  mustIsPGR: boolean;
  mustIsPPP: boolean;
  mustIsPCMSO: boolean;
  mustIsAso: boolean;
  sort: StoredRiskRegisteredSort | null;
};

type QueryLike = Record<string, string | string[] | undefined>;

/** Keys that belong to the fatores-riscos list context (carried to /edit and back). */
export const RISKS_LIST_QUERY_KEYS = [
  'search',
  'page',
  'pageSize',
  'status',
  'riskTypes',
  'severities',
  'riskSubTypeIds',
  'mustIsPGR',
  'mustIsPPP',
  'mustIsPCMSO',
  'mustIsAso',
  'listSortBy',
  'listSortOrder',
] as const;

const STATUS_VALUES: RiskStatusFilter[] = ['ACTIVE', 'INACTIVE', 'ALL'];

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function csv(value: string | string[] | undefined): string[] {
  const raw = first(value);
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function toPositiveInt(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const raw = Number(first(value));
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : fallback;
}

function toOptionalPositiveInt(
  value: string | string[] | undefined,
): number | null {
  const raw = first(value);
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

function toFlag(value: string | string[] | undefined): boolean {
  const raw = first(value);
  return raw === '1' || raw === 'true';
}

export function parseRisksListQuery(query: QueryLike): RisksListUrlState {
  const statusRaw = first(query.status);
  const status = STATUS_VALUES.includes(statusRaw as RiskStatusFilter)
    ? (statusRaw as RiskStatusFilter)
    : 'ACTIVE';

  const listSortBy = first(query.listSortBy) as
    | RiskRegisteredListSortBy
    | undefined;
  const listSortOrder = first(query.listSortOrder);
  const sort: StoredRiskRegisteredSort | null =
    listSortBy && (listSortOrder === 'asc' || listSortOrder === 'desc')
      ? { field: listSortBy, order: listSortOrder }
      : null;

  return {
    search: first(query.search)?.trim() || '',
    page: toPositiveInt(query.page, 1),
    pageSize: toOptionalPositiveInt(query.pageSize),
    status,
    riskTypes: csv(query.riskTypes),
    severities: csv(query.severities)
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n)),
    riskSubTypeIds: csv(query.riskSubTypeIds)
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n)),
    mustIsPGR: toFlag(query.mustIsPGR),
    mustIsPPP: toFlag(query.mustIsPPP),
    mustIsPCMSO: toFlag(query.mustIsPCMSO),
    mustIsAso: toFlag(query.mustIsAso),
    sort,
  };
}

export function serializeRisksListQuery(
  state: RisksListUrlState,
): Record<string, string> {
  const query: Record<string, string> = {};

  if (state.search) query.search = state.search;
  if (state.page > 1) query.page = String(state.page);
  if (state.pageSize) query.pageSize = String(state.pageSize);
  if (state.status && state.status !== 'ACTIVE') query.status = state.status;

  if (state.riskTypes.length) query.riskTypes = state.riskTypes.join(',');
  if (state.severities.length) {
    query.severities = state.severities.join(',');
  }
  if (state.riskSubTypeIds.length) {
    query.riskSubTypeIds = state.riskSubTypeIds.join(',');
  }
  if (state.mustIsPGR) query.mustIsPGR = '1';
  if (state.mustIsPPP) query.mustIsPPP = '1';
  if (state.mustIsPCMSO) query.mustIsPCMSO = '1';
  if (state.mustIsAso) query.mustIsAso = '1';

  if (state.sort?.field && state.sort.order) {
    query.listSortBy = state.sort.field;
    query.listSortOrder = state.sort.order;
  }

  return query;
}

/** Keep only list-context keys (drop riskId noise, etc.). Preserves `active` when present. */
export function pickRisksListQueryFromRouter(
  query: QueryLike,
): Record<string, string> {
  const next: Record<string, string> = {};
  for (const key of RISKS_LIST_QUERY_KEYS) {
    const value = first(query[key]);
    if (value != null && value !== '') next[key] = value;
  }
  const active = first(query.active);
  if (active != null && active !== '') next.active = active;
  return next;
}

export function risksListQueryEqual(
  a: Record<string, string>,
  b: Record<string, string>,
): boolean {
  const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).sort();
  return keys.every((key) => (a[key] || '') === (b[key] || ''));
}

/** Rebuild Filtrar tag state from URL (names may be value-based for subtypes). */
export function buildRegisteredFiltersFromUrl(
  state: RisksListUrlState,
): IFilterTableData {
  const next: IFilterTableData = {};

  if (state.riskTypes.length) {
    next[FilterFieldEnum.RISK_TYPES] = {
      field: FilterFieldEnum.RISK_TYPES,
      filters: state.riskTypes.map((value) => ({
        filterValue: value,
        name: value,
        field: FilterFieldEnum.RISK_TYPES,
      })),
      data: state.riskTypes,
    };
  }

  if (state.severities.length) {
    next[FilterFieldEnum.RISK_SEVERITIES] = {
      field: FilterFieldEnum.RISK_SEVERITIES,
      filters: state.severities.map((value) => ({
        filterValue: String(value),
        name: `Sev. ${value}`,
        field: FilterFieldEnum.RISK_SEVERITIES,
      })),
      data: state.severities,
    };
  }

  if (state.riskSubTypeIds.length) {
    next[FilterFieldEnum.RISK_SUB_TYPE_IDS] = {
      field: FilterFieldEnum.RISK_SUB_TYPE_IDS,
      filters: state.riskSubTypeIds.map((value) => ({
        filterValue: String(value),
        name: `Subtipo ${value}`,
        field: FilterFieldEnum.RISK_SUB_TYPE_IDS,
      })),
      data: state.riskSubTypeIds.map((id) => ({
        id,
        name: `Subtipo ${id}`,
        filterValue: String(id),
      })),
    };
  }

  if (state.mustIsPGR) {
    next[FilterFieldEnum.RISK_MUST_IS_PGR] = {
      field: FilterFieldEnum.RISK_MUST_IS_PGR,
      filters: [
        {
          filterValue: 'true',
          name: 'Com PGR',
          field: FilterFieldEnum.RISK_MUST_IS_PGR,
        },
      ],
      data: [{ filterValue: 'true' }],
    };
  }
  if (state.mustIsPPP) {
    next[FilterFieldEnum.RISK_MUST_IS_PPP] = {
      field: FilterFieldEnum.RISK_MUST_IS_PPP,
      filters: [
        {
          filterValue: 'true',
          name: 'Com PPP',
          field: FilterFieldEnum.RISK_MUST_IS_PPP,
        },
      ],
      data: [{ filterValue: 'true' }],
    };
  }
  if (state.mustIsPCMSO) {
    next[FilterFieldEnum.RISK_MUST_IS_PCMSO] = {
      field: FilterFieldEnum.RISK_MUST_IS_PCMSO,
      filters: [
        {
          filterValue: 'true',
          name: 'Com PCMSO',
          field: FilterFieldEnum.RISK_MUST_IS_PCMSO,
        },
      ],
      data: [{ filterValue: 'true' }],
    };
  }
  if (state.mustIsAso) {
    next[FilterFieldEnum.RISK_MUST_IS_ASO] = {
      field: FilterFieldEnum.RISK_MUST_IS_ASO,
      filters: [
        {
          filterValue: 'true',
          name: 'Com ASO',
          field: FilterFieldEnum.RISK_MUST_IS_ASO,
        },
      ],
      data: [{ filterValue: 'true' }],
    };
  }

  return next;
}
