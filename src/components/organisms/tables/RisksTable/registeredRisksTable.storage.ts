import {
  RiskRegisteredColumnId,
  RiskRegisteredListSortBy,
} from './registeredRisksTable.types';

const KEY_PAGE_SIZE = 'RISKS_REGISTERED_TABLE_PAGE_SIZE';
const KEY_HIDDEN = 'RISKS_REGISTERED_TABLE_HIDDEN_COLUMNS';
const KEY_SORT = 'RISKS_REGISTERED_TABLE_SORT';

export const RISKS_REGISTERED_TABLE_PAGE_SIZES = [15, 25, 50, 100] as const;

export const DEFAULT_RISKS_REGISTERED_PAGE_SIZE = 15;

export function isAllowedRisksRegisteredPageSize(n: number): boolean {
  return (RISKS_REGISTERED_TABLE_PAGE_SIZES as readonly number[]).includes(n);
}

export function loadRisksRegisteredPageSize(): number {
  try {
    const raw = localStorage.getItem(KEY_PAGE_SIZE);
    if (!raw) return DEFAULT_RISKS_REGISTERED_PAGE_SIZE;
    const n = Number(JSON.parse(raw));
    return isAllowedRisksRegisteredPageSize(n)
      ? n
      : DEFAULT_RISKS_REGISTERED_PAGE_SIZE;
  } catch {
    return DEFAULT_RISKS_REGISTERED_PAGE_SIZE;
  }
}

export function saveRisksRegisteredPageSize(n: number): void {
  if (!isAllowedRisksRegisteredPageSize(n)) return;
  localStorage.setItem(KEY_PAGE_SIZE, JSON.stringify(n));
}

export function loadRisksRegisteredHiddenColumns(): Partial<
  Record<RiskRegisteredColumnId, boolean>
> {
  try {
    const raw = localStorage.getItem(KEY_HIDDEN);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRisksRegisteredHiddenColumns(
  hidden: Partial<Record<RiskRegisteredColumnId, boolean>>,
): void {
  localStorage.setItem(KEY_HIDDEN, JSON.stringify(hidden));
}

export type StoredRiskRegisteredSort = {
  field: RiskRegisteredListSortBy;
  order: 'asc' | 'desc';
};

export function loadRisksRegisteredSort(): StoredRiskRegisteredSort | null {
  try {
    const raw = localStorage.getItem(KEY_SORT);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredRiskRegisteredSort;
    if (!v?.field || !v?.order) return null;
    return v;
  } catch {
    return null;
  }
}

export function saveRisksRegisteredSort(
  sort: StoredRiskRegisteredSort | null,
): void {
  if (!sort) {
    localStorage.removeItem(KEY_SORT);
    return;
  }
  localStorage.setItem(KEY_SORT, JSON.stringify(sort));
}
