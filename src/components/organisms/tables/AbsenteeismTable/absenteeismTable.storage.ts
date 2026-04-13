import {
  AbsenteeismListSortBy,
  AbsenteeismTableColumnId,
} from './absenteeismTable.types';

const KEY_PAGE_SIZE = 'ABSENTEEISM_TABLE_PAGE_SIZE';
const KEY_HIDDEN = 'ABSENTEEISM_TABLE_HIDDEN_COLUMNS';
const KEY_SORT = 'ABSENTEEISM_TABLE_SORT';

export const ABSENTEEISM_TABLE_PAGE_SIZES = [15, 25, 50, 100] as const;

export const DEFAULT_ABSENTEEISM_PAGE_SIZE = 15;

export function isAllowedAbsenteeismPageSize(n: number): boolean {
  return (ABSENTEEISM_TABLE_PAGE_SIZES as readonly number[]).includes(n);
}

export function loadAbsenteeismPageSize(): number {
  try {
    const raw = localStorage.getItem(KEY_PAGE_SIZE);
    if (!raw) return DEFAULT_ABSENTEEISM_PAGE_SIZE;
    const n = Number(JSON.parse(raw));
    return isAllowedAbsenteeismPageSize(n)
      ? n
      : DEFAULT_ABSENTEEISM_PAGE_SIZE;
  } catch {
    return DEFAULT_ABSENTEEISM_PAGE_SIZE;
  }
}

export function saveAbsenteeismPageSize(n: number): void {
  if (!isAllowedAbsenteeismPageSize(n)) return;
  localStorage.setItem(KEY_PAGE_SIZE, JSON.stringify(n));
}

export function loadAbsenteeismHiddenColumns(): Partial<
  Record<AbsenteeismTableColumnId, boolean>
> {
  try {
    const raw = localStorage.getItem(KEY_HIDDEN);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAbsenteeismHiddenColumns(
  hidden: Partial<Record<AbsenteeismTableColumnId, boolean>>,
): void {
  localStorage.setItem(KEY_HIDDEN, JSON.stringify(hidden));
}

export type StoredAbsenteeismSort = {
  field: AbsenteeismListSortBy;
  order: 'asc' | 'desc';
};

export function loadAbsenteeismSort(): StoredAbsenteeismSort | null {
  try {
    const raw = localStorage.getItem(KEY_SORT);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredAbsenteeismSort;
    if (!v?.field || !v?.order) return null;
    return v;
  } catch {
    return null;
  }
}

export function saveAbsenteeismSort(sort: StoredAbsenteeismSort | null): void {
  if (!sort) {
    localStorage.removeItem(KEY_SORT);
    return;
  }
  localStorage.setItem(KEY_SORT, JSON.stringify(sort));
}
