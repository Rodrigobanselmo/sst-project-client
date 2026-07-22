import type {
  BrowseFrpsExplainabilityLibraryParams,
  FrpsLibraryBrowseItem,
  FrpsLibraryConceptualStatus,
  FrpsLibraryKind,
} from '@v2/services/forms/frps-explainability-library';

export const FRPS_LIBRARY_DEFAULT_RISK_TYPE = 'ERG';
export const FRPS_LIBRARY_DEFAULT_RISK_SUB_TYPE_ENUM = 'PSICOSOCIAL';
export const FRPS_LIBRARY_DEFAULT_LIMIT = 20;

export type FrpsLibraryUrlFilters = {
  riskType: string | null;
  riskSubTypeEnum: string | null;
  riskSubTypeId: number | null;
  riskId: string | null;
  kind: FrpsLibraryKind | null;
  status: FrpsLibraryConceptualStatus | null;
  search: string;
  page: number;
  limit: number;
  generalCatalog: boolean;
};

type QueryLike = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function toBoolean(value: string | string[] | undefined): boolean {
  const raw = first(value);
  return raw === 'true' || raw === '1';
}

function toPositiveInt(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const raw = Number(first(value));
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : fallback;
}

export function shouldApplyFrpsLibraryDefaultScope(query: QueryLike): boolean {
  if (toBoolean(query.generalCatalog)) return false;
  return !(
    first(query.riskType) ||
    first(query.riskSubTypeEnum) ||
    first(query.riskSubTypeId) ||
    first(query.riskId)
  );
}

export function getFrpsLibraryDefaultUrlQuery(): Record<string, string> {
  return {
    riskType: FRPS_LIBRARY_DEFAULT_RISK_TYPE,
    riskSubTypeEnum: FRPS_LIBRARY_DEFAULT_RISK_SUB_TYPE_ENUM,
    page: '1',
    limit: String(FRPS_LIBRARY_DEFAULT_LIMIT),
  };
}

export function parseFrpsLibraryFiltersFromQuery(
  query: QueryLike,
): FrpsLibraryUrlFilters {
  const kind = first(query.kind);
  const status = first(query.status);
  const riskSubTypeIdRaw = first(query.riskSubTypeId);
  const riskSubTypeId =
    riskSubTypeIdRaw && Number.isFinite(Number(riskSubTypeIdRaw))
      ? Number(riskSubTypeIdRaw)
      : null;

  return {
    riskType: first(query.riskType) || null,
    riskSubTypeEnum: first(query.riskSubTypeEnum) || null,
    riskSubTypeId,
    riskId: first(query.riskId) || null,
    kind:
      kind === 'SOURCE' || kind === 'RECOMMENDATION'
        ? kind
        : null,
    status:
      status === 'NEVER_GENERATED' ||
      status === 'DRAFT_AI' ||
      status === 'VALIDATED' ||
      status === 'REJECTED'
        ? status
        : null,
    search: first(query.search)?.trim() || '',
    page: toPositiveInt(query.page, 1),
    limit: toPositiveInt(query.limit, FRPS_LIBRARY_DEFAULT_LIMIT),
    generalCatalog: toBoolean(query.generalCatalog),
  };
}

export function serializeFrpsLibraryFiltersToQuery(
  filters: FrpsLibraryUrlFilters,
): Record<string, string> {
  const query: Record<string, string> = {
    page: String(filters.page || 1),
    limit: String(filters.limit || FRPS_LIBRARY_DEFAULT_LIMIT),
  };

  if (filters.generalCatalog) {
    query.generalCatalog = 'true';
  } else {
    if (filters.riskType) query.riskType = filters.riskType;
    if (filters.riskSubTypeEnum) {
      query.riskSubTypeEnum = filters.riskSubTypeEnum;
    }
  }

  if (filters.riskSubTypeId != null) {
    query.riskSubTypeId = String(filters.riskSubTypeId);
  }
  if (filters.riskId) query.riskId = filters.riskId;
  if (filters.kind) query.kind = filters.kind;
  if (filters.status) query.status = filters.status;
  if (filters.search.trim()) query.search = filters.search.trim();

  return query;
}

export function buildFrpsLibraryBrowseParams(
  filters: FrpsLibraryUrlFilters,
): BrowseFrpsExplainabilityLibraryParams {
  return {
    riskType: filters.generalCatalog ? undefined : filters.riskType || undefined,
    riskSubTypeEnum: filters.generalCatalog
      ? undefined
      : filters.riskSubTypeEnum || undefined,
    riskSubTypeId: filters.riskSubTypeId ?? undefined,
    riskId: filters.riskId || undefined,
    kind: filters.kind || undefined,
    status: filters.status || undefined,
    search: filters.search.trim() || undefined,
    page: filters.page,
    limit: filters.limit,
    generalCatalog: filters.generalCatalog || undefined,
  };
}

/** Limpa seleções incompatíveis ao mudar categoria. */
export function applyFrpsLibraryCategoryChange(
  filters: FrpsLibraryUrlFilters,
  riskType: string | null,
): FrpsLibraryUrlFilters {
  return {
    ...filters,
    riskType,
    riskSubTypeEnum: null,
    riskSubTypeId: null,
    riskId: null,
    generalCatalog: false,
    page: 1,
  };
}

export function applyFrpsLibrarySubtypeChange(
  filters: FrpsLibraryUrlFilters,
  riskSubTypeEnum: string | null,
  riskSubTypeId: number | null = null,
): FrpsLibraryUrlFilters {
  return {
    ...filters,
    riskSubTypeEnum,
    riskSubTypeId,
    riskId: null,
    generalCatalog: false,
    page: 1,
  };
}

export function applyFrpsLibraryGeneralCatalog(
  filters: FrpsLibraryUrlFilters,
): FrpsLibraryUrlFilters {
  return {
    ...filters,
    riskType: null,
    riskSubTypeEnum: null,
    riskSubTypeId: null,
    riskId: null,
    generalCatalog: true,
    page: 1,
  };
}

export function getFrpsLibraryItemTypeLabel(
  itemType: FrpsLibraryBrowseItem['itemType'],
): string {
  switch (itemType) {
    case 'SOURCE':
      return 'Fonte';
    case 'ENGINEERING_RECOMMENDATION':
      return 'Engenharia';
    case 'ADMINISTRATIVE_RECOMMENDATION':
      return 'Administrativa';
    default:
      return itemType;
  }
}

export function getFrpsLibraryStatusLabel(
  status: FrpsLibraryConceptualStatus,
): string {
  switch (status) {
    case 'NEVER_GENERATED':
      return 'Nunca gerado';
    case 'DRAFT_AI':
      return 'Rascunho';
    case 'VALIDATED':
      return 'Validado';
    case 'REJECTED':
      return 'Rejeitado';
    default:
      return status;
  }
}

export type FrpsLibraryTableRow = {
  id: string;
  name: string;
  typeLabel: string;
  riskName: string;
  subtypeLabel: string;
  status: FrpsLibraryConceptualStatus;
  statusLabel: string;
  updatedAtLabel: string;
};

export function mapFrpsLibraryItemToTableRow(
  item: FrpsLibraryBrowseItem,
): FrpsLibraryTableRow {
  return {
    id: item.systemCatalogId,
    name: item.name,
    typeLabel: getFrpsLibraryItemTypeLabel(item.itemType),
    riskName: item.riskName,
    subtypeLabel: item.riskSubType?.name || '—',
    status: item.conceptualStatus,
    statusLabel: getFrpsLibraryStatusLabel(item.conceptualStatus),
    updatedAtLabel: formatFrpsLibraryDate(item.updatedAt),
  };
}

export function formatFrpsLibraryDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}
