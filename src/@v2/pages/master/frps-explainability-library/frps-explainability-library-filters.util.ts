import type {
  BrowseFrpsCatalogAdminParams,
  FrpsCatalogAdminCatalogType,
  FrpsCatalogAdminItem,
  FrpsCatalogAdminOriginFilter,
  FrpsCatalogAdminUsability,
  FrpsLibraryConceptualStatus,
} from '@v2/services/forms/frps-explainability-library/service/frps-explainability-library.types';
import { isFrpsInvalidSystemReference } from '@v2/services/forms/frps-explainability-library/service/frps-library-row-actions.util';

import {
  FRPS_GLOBAL_COMPANY_DISPLAY_NAME,
  FRPS_GLOBAL_ORIGIN_DISPLAY_NAME,
  type FrpsGlobalCandidateHint,
} from './frps-catalog-admin-equivalence.util';
import { FRPS_INVALID_SYSTEM_REFERENCE_CHIP_LABEL } from './frps-library-unlink-canonical.util';
export const FRPS_LIBRARY_DEFAULT_RISK_TYPE = 'ERG';
export const FRPS_LIBRARY_DEFAULT_RISK_SUB_TYPE_ENUM = 'PSICOSOCIAL';
export const FRPS_LIBRARY_DEFAULT_LIMIT = 15;

export type FrpsLibraryUrlFilters = {
  riskType: string | null;
  riskSubTypeEnum: string | null;
  riskSubTypeId: number | null;
  riskId: string | null;
  catalogType: FrpsCatalogAdminCatalogType | null;
  origin: FrpsCatalogAdminOriginFilter;
  companyId: string | null;
  status: FrpsLibraryConceptualStatus | null;
  hasExplanation: boolean | null;
  hasEquivalence: boolean | null;
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

function toOptionalBoolean(
  value: string | string[] | undefined,
): boolean | null {
  const raw = first(value);
  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  return null;
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
  const catalogType = first(query.catalogType);
  const status = first(query.status);
  const origin = first(query.origin);
  const riskSubTypeIdRaw = first(query.riskSubTypeId);
  const riskSubTypeId =
    riskSubTypeIdRaw && Number.isFinite(Number(riskSubTypeIdRaw))
      ? Number(riskSubTypeIdRaw)
      : null;

  // Compat: kind legado SOURCE|RECOMMENDATION → catalogType SOURCE ou null
  const legacyKind = first(query.kind);

  return {
    riskType: first(query.riskType) || null,
    riskSubTypeEnum: first(query.riskSubTypeEnum) || null,
    riskSubTypeId,
    riskId: first(query.riskId) || null,
    catalogType:
      catalogType === 'SOURCE' ||
      catalogType === 'ADM' ||
      catalogType === 'ENG'
        ? catalogType
        : legacyKind === 'SOURCE'
          ? 'SOURCE'
          : null,
    origin:
      origin === 'GLOBAL' || origin === 'LOCAL' || origin === 'ALL'
        ? origin
        : 'ALL',
    companyId: first(query.companyId) || null,
    status:
      status === 'NEVER_GENERATED' ||
      status === 'DRAFT_AI' ||
      status === 'VALIDATED' ||
      status === 'REJECTED'
        ? status
        : null,
    hasExplanation: toOptionalBoolean(query.hasExplanation),
    hasEquivalence: toOptionalBoolean(query.hasEquivalence),
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
  if (filters.catalogType) query.catalogType = filters.catalogType;
  if (filters.origin && filters.origin !== 'ALL') query.origin = filters.origin;
  if (filters.companyId) query.companyId = filters.companyId;
  if (filters.status) query.status = filters.status;
  if (filters.hasExplanation !== null) {
    query.hasExplanation = String(filters.hasExplanation);
  }
  if (filters.hasEquivalence !== null) {
    query.hasEquivalence = String(filters.hasEquivalence);
  }
  if (filters.search.trim()) query.search = filters.search.trim();

  return query;
}

export function buildFrpsLibraryBrowseParams(
  filters: FrpsLibraryUrlFilters,
): BrowseFrpsCatalogAdminParams {
  return {
    riskType: filters.generalCatalog ? undefined : filters.riskType || undefined,
    riskSubTypeEnum: filters.generalCatalog
      ? undefined
      : filters.riskSubTypeEnum || undefined,
    riskSubTypeId: filters.riskSubTypeId ?? undefined,
    riskId: filters.riskId || undefined,
    catalogType: filters.catalogType || undefined,
    origin: filters.origin === 'ALL' ? undefined : filters.origin,
    companyId: filters.companyId || undefined,
    status: filters.status || undefined,
    hasExplanation:
      filters.hasExplanation === null ? undefined : filters.hasExplanation,
    hasEquivalence:
      filters.hasEquivalence === null ? undefined : filters.hasEquivalence,
    search: filters.search.trim() || undefined,
    page: filters.page,
    limit: filters.limit,
    generalCatalog: filters.generalCatalog || undefined,
  };
}

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
  itemType: FrpsCatalogAdminItem['itemType'],
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

export function getFrpsOriginLabel(origin: FrpsCatalogAdminItem['origin']): string {
  return origin === 'GLOBAL' ? 'Global' : 'Local';
}

export type FrpsLibraryTableRow = {
  id: string;
  catalogId: string;
  itemType: FrpsCatalogAdminItem['itemType'];
  kind: FrpsCatalogAdminItem['kind'];
  conceptualExplanationId: string | null;
  name: string;
  typeLabel: string;
  riskName: string;
  subtypeLabel: string;
  origin: FrpsCatalogAdminItem['origin'];
  originLabel: string;
  companyName: string | null;
  status: FrpsLibraryConceptualStatus;
  statusLabel: string;
  equivalenceLabel: string;
  hasActiveEquivalence: boolean;
  equivalenceId: string | null;
  isCanonical: boolean;
  isAliasRow: boolean;
  /** Alias sem o canônico na página atual (grupo partido). */
  isOrphanAliasOnPage: boolean;
  aliasCount: number;
  parentCanonicalId: string | null;
  canonicalLabel: string | null;
  catalogUsability: FrpsCatalogAdminUsability;
  generateable: boolean;
  isInvalidSystemReference: boolean;
  /** Indicativo informativo; não cria equivalência. */
  globalCandidateHint: FrpsGlobalCandidateHint;
  updatedAtLabel: string;
  raw: FrpsCatalogAdminItem;
};

export function buildFrpsEquivalenceLabel(item: FrpsCatalogAdminItem): string {
  if (item.activeEquivalence) {
    return `Alias → ${item.activeEquivalence.canonicalLabel}`;
  }
  if (item.isCanonical && item.aliasCount > 0) {
    const n = item.aliasCount;
    return `Canônico · ${n} ${n === 1 ? 'alias' : 'aliases'}`;
  }
  return 'Sem equivalência';
}

export function mapFrpsLibraryItemToTableRow(
  item: FrpsCatalogAdminItem,
  options?: {
    globalCandidateHint?: FrpsGlobalCandidateHint;
    /** Ids de canônicos presentes na página atual (para detectar alias órfão). */
    canonicalIdsOnPage?: Set<string>;
  },
): FrpsLibraryTableRow {
  const isAliasRow = Boolean(item.activeEquivalence || item.parentCanonicalId);
  const parentCanonicalId =
    item.parentCanonicalId ?? item.activeEquivalence?.canonicalId ?? null;
  const isOrphanAliasOnPage = Boolean(
    isAliasRow &&
      parentCanonicalId &&
      options?.canonicalIdsOnPage &&
      !options.canonicalIdsOnPage.has(parentCanonicalId),
  );
  const catalogUsability = item.catalogUsability ?? 'USABLE';
  const generateable = item.generateable !== false;
  const invalidSystemReference = isFrpsInvalidSystemReference(catalogUsability);

  return {
    id: `${item.itemType}:${item.id}`,
    catalogId: item.id,
    itemType: item.itemType,
    kind: item.kind,
    conceptualExplanationId: item.conceptualExplanation.explanationId,
    name: item.label,
    typeLabel: getFrpsLibraryItemTypeLabel(item.itemType),
    riskName: item.riskName,
    subtypeLabel: item.riskSubType?.name || '—',
    origin: item.origin,
    originLabel: getFrpsOriginLabel(item.origin),
    companyName:
      item.origin === 'LOCAL'
        ? item.companyName
        : FRPS_GLOBAL_COMPANY_DISPLAY_NAME,
    status: item.conceptualExplanation.status,
    statusLabel: invalidSystemReference
      ? FRPS_INVALID_SYSTEM_REFERENCE_CHIP_LABEL
      : getFrpsLibraryStatusLabel(item.conceptualExplanation.status),
    equivalenceLabel: buildFrpsEquivalenceLabel(item),
    hasActiveEquivalence: Boolean(item.activeEquivalence),
    equivalenceId: item.activeEquivalence?.equivalenceId ?? null,
    isCanonical: Boolean(item.isCanonical),
    isAliasRow,
    isOrphanAliasOnPage,
    aliasCount: item.aliasCount ?? 0,
    parentCanonicalId,
    canonicalLabel: item.activeEquivalence?.canonicalLabel ?? null,
    catalogUsability,
    generateable,
    isInvalidSystemReference: invalidSystemReference,
    globalCandidateHint: options?.globalCandidateHint ?? {
      status: 'NONE',
      count: 0,
      sampleLabel: null,
    },
    updatedAtLabel: formatFrpsLibraryDate(item.updatedAt),
    raw: item,
  };
}

export function formatFrpsLibraryDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
}

export { FRPS_GLOBAL_ORIGIN_DISPLAY_NAME };
