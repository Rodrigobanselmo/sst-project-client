import { CompaniesListSortBy, CompaniesTableColumnId } from './companiesTable.types';

const KEY_PAGE_SIZE = 'COMPANIES_TABLE_PAGE_SIZE';
const KEY_HIDDEN = 'COMPANIES_TABLE_HIDDEN_COLUMNS';
const KEY_SORT = 'COMPANIES_TABLE_SORT';

export const COMPANIES_TABLE_PAGE_SIZES = [15, 25, 50, 100] as const;

export const DEFAULT_COMPANIES_PAGE_SIZE = 15;

export function isAllowedCompaniesPageSize(n: number): boolean {
  return (COMPANIES_TABLE_PAGE_SIZES as readonly number[]).includes(n);
}

export function loadCompaniesPageSize(): number {
  try {
    const raw = localStorage.getItem(KEY_PAGE_SIZE);
    if (!raw) return DEFAULT_COMPANIES_PAGE_SIZE;
    const n = Number(JSON.parse(raw));
    return isAllowedCompaniesPageSize(n) ? n : DEFAULT_COMPANIES_PAGE_SIZE;
  } catch {
    return DEFAULT_COMPANIES_PAGE_SIZE;
  }
}

export function saveCompaniesPageSize(n: number): void {
  if (!isAllowedCompaniesPageSize(n)) return;
  localStorage.setItem(KEY_PAGE_SIZE, JSON.stringify(n));
}

export function loadCompaniesHiddenColumns(): Partial<
  Record<CompaniesTableColumnId, boolean>
> {
  try {
    const raw = localStorage.getItem(KEY_HIDDEN);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCompaniesHiddenColumns(
  hidden: Partial<Record<CompaniesTableColumnId, boolean>>,
): void {
  localStorage.setItem(KEY_HIDDEN, JSON.stringify(hidden));
}

export type StoredCompaniesSort = {
  field: CompaniesListSortBy;
  order: 'asc' | 'desc';
};

export function loadCompaniesSort(): StoredCompaniesSort | null {
  try {
    const raw = localStorage.getItem(KEY_SORT);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredCompaniesSort;
    if (!v?.field || !v?.order) return null;
    return v;
  } catch {
    return null;
  }
}

export function saveCompaniesSort(sort: StoredCompaniesSort | null): void {
  if (!sort) {
    localStorage.removeItem(KEY_SORT);
    return;
  }
  localStorage.setItem(KEY_SORT, JSON.stringify(sort));
}
