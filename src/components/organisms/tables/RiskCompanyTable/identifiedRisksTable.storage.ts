import {
  RiskIdentifiedColumnId,
  RiskIdentifiedListSortBy,
} from './identifiedRisksTable.types';

const KEY_PAGE_SIZE = 'RISKS_IDENTIFIED_TABLE_PAGE_SIZE';
const KEY_HIDDEN = 'RISKS_IDENTIFIED_TABLE_HIDDEN_COLUMNS';
const KEY_SORT = 'RISKS_IDENTIFIED_TABLE_SORT';

export const RISKS_IDENTIFIED_TABLE_PAGE_SIZES = [15, 25, 50, 100] as const;

export const DEFAULT_RISKS_IDENTIFIED_PAGE_SIZE = 15;

export function isAllowedRisksIdentifiedPageSize(n: number): boolean {
  return (RISKS_IDENTIFIED_TABLE_PAGE_SIZES as readonly number[]).includes(n);
}

export function loadRisksIdentifiedPageSize(): number {
  try {
    const raw = localStorage.getItem(KEY_PAGE_SIZE);
    if (!raw) return DEFAULT_RISKS_IDENTIFIED_PAGE_SIZE;
    const n = Number(JSON.parse(raw));
    return isAllowedRisksIdentifiedPageSize(n)
      ? n
      : DEFAULT_RISKS_IDENTIFIED_PAGE_SIZE;
  } catch {
    return DEFAULT_RISKS_IDENTIFIED_PAGE_SIZE;
  }
}

export function saveRisksIdentifiedPageSize(n: number): void {
  if (!isAllowedRisksIdentifiedPageSize(n)) return;
  localStorage.setItem(KEY_PAGE_SIZE, JSON.stringify(n));
}

export function loadRisksIdentifiedHiddenColumns(): Partial<
  Record<RiskIdentifiedColumnId, boolean>
> {
  try {
    const raw = localStorage.getItem(KEY_HIDDEN);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRisksIdentifiedHiddenColumns(
  hidden: Partial<Record<RiskIdentifiedColumnId, boolean>>,
): void {
  localStorage.setItem(KEY_HIDDEN, JSON.stringify(hidden));
}

export type StoredRiskIdentifiedSort = {
  field: RiskIdentifiedListSortBy;
  order: 'asc' | 'desc';
};

export function loadRisksIdentifiedSort(): StoredRiskIdentifiedSort | null {
  try {
    const raw = localStorage.getItem(KEY_SORT);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredRiskIdentifiedSort;
    if (!v?.field || !v?.order) return null;
    return v;
  } catch {
    return null;
  }
}

export function saveRisksIdentifiedSort(
  sort: StoredRiskIdentifiedSort | null,
): void {
  if (!sort) {
    localStorage.removeItem(KEY_SORT);
    return;
  }
  localStorage.setItem(KEY_SORT, JSON.stringify(sort));
}
