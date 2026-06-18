import { DocTableSortBy } from './docTable.types';

const KEY_PAGE_SIZE = 'DOC_VERSIONS_TABLE_PAGE_SIZE';
const KEY_HIDDEN = 'DOC_VERSIONS_TABLE_HIDDEN_COLUMNS';
const KEY_SORT = 'DOC_VERSIONS_TABLE_SORT';
const KEY_FAMILY_FILTER = 'DOC_VERSIONS_TABLE_FAMILY_FILTER';

export const DOC_VERSIONS_TABLE_PAGE_SIZES = [15, 25, 50, 100] as const;

export const DEFAULT_DOC_VERSIONS_PAGE_SIZE = 15;

export function isAllowedDocVersionsPageSize(n: number): boolean {
  return (DOC_VERSIONS_TABLE_PAGE_SIZES as readonly number[]).includes(n);
}

export function loadDocVersionsPageSize(): number {
  try {
    const raw = localStorage.getItem(KEY_PAGE_SIZE);
    if (!raw) return DEFAULT_DOC_VERSIONS_PAGE_SIZE;
    const n = Number(JSON.parse(raw));
    return isAllowedDocVersionsPageSize(n)
      ? n
      : DEFAULT_DOC_VERSIONS_PAGE_SIZE;
  } catch {
    return DEFAULT_DOC_VERSIONS_PAGE_SIZE;
  }
}

export function saveDocVersionsPageSize(n: number): void {
  if (!isAllowedDocVersionsPageSize(n)) return;
  localStorage.setItem(KEY_PAGE_SIZE, JSON.stringify(n));
}

export function loadHiddenDocVersionsColumns(): Partial<
  Record<string, boolean>
> {
  try {
    const raw = localStorage.getItem(KEY_HIDDEN);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveHiddenDocVersionsColumns(
  hidden: Partial<Record<string, boolean>>,
): void {
  localStorage.setItem(KEY_HIDDEN, JSON.stringify(hidden));
}

export type StoredDocVersionsSort = {
  field: DocTableSortBy;
  order: 'asc' | 'desc';
};

export function loadDocVersionsSort(): StoredDocVersionsSort | null {
  try {
    const raw = localStorage.getItem(KEY_SORT);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredDocVersionsSort;
    if (!v?.field || !v?.order) return null;
    return v;
  } catch {
    return null;
  }
}

export function saveDocVersionsSort(sort: StoredDocVersionsSort | null): void {
  if (!sort) {
    localStorage.removeItem(KEY_SORT);
    return;
  }
  localStorage.setItem(KEY_SORT, JSON.stringify(sort));
}

export function loadDocVersionsFamilyFilter():
  | 'all'
  | 'test'
  | 'official' {
  try {
    const raw = localStorage.getItem(KEY_FAMILY_FILTER);
    if (raw === 'test' || raw === 'official') return raw;
    return 'all';
  } catch {
    return 'all';
  }
}

export function saveDocVersionsFamilyFilter(
  filter: 'all' | 'test' | 'official',
): void {
  localStorage.setItem(KEY_FAMILY_FILTER, filter);
}
