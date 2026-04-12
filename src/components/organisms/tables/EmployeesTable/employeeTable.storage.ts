import { EmployeeListSortBy } from './employeeTable.types';

const KEY_PAGE_SIZE = 'EMPLOYEES_TABLE_PAGE_SIZE';
const KEY_HIDDEN = 'EMPLOYEES_TABLE_HIDDEN_COLUMNS';
const KEY_SORT = 'EMPLOYEES_TABLE_SORT';

export const EMPLOYEES_TABLE_PAGE_SIZES = [15, 25, 50, 100] as const;

export const DEFAULT_EMPLOYEES_PAGE_SIZE = 15;

export function isAllowedEmployeesPageSize(n: number): boolean {
  return (EMPLOYEES_TABLE_PAGE_SIZES as readonly number[]).includes(n);
}

export function loadEmployeesPageSize(): number {
  try {
    const raw = localStorage.getItem(KEY_PAGE_SIZE);
    if (!raw) return DEFAULT_EMPLOYEES_PAGE_SIZE;
    const n = Number(JSON.parse(raw));
    return isAllowedEmployeesPageSize(n) ? n : DEFAULT_EMPLOYEES_PAGE_SIZE;
  } catch {
    return DEFAULT_EMPLOYEES_PAGE_SIZE;
  }
}

export function saveEmployeesPageSize(n: number): void {
  if (!isAllowedEmployeesPageSize(n)) return;
  localStorage.setItem(KEY_PAGE_SIZE, JSON.stringify(n));
}

export function loadHiddenEmployeeColumns(): Partial<
  Record<string, boolean>
> {
  try {
    const raw = localStorage.getItem(KEY_HIDDEN);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveHiddenEmployeeColumns(
  hidden: Partial<Record<string, boolean>>,
): void {
  localStorage.setItem(KEY_HIDDEN, JSON.stringify(hidden));
}

export type StoredEmployeeSort = {
  field: EmployeeListSortBy;
  order: 'asc' | 'desc';
};

export function loadEmployeesSort(): StoredEmployeeSort | null {
  try {
    const raw = localStorage.getItem(KEY_SORT);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredEmployeeSort;
    if (!v?.field || !v?.order) return null;
    return v;
  } catch {
    return null;
  }
}

export function saveEmployeesSort(sort: StoredEmployeeSort | null): void {
  if (!sort) {
    localStorage.removeItem(KEY_SORT);
    return;
  }
  localStorage.setItem(KEY_SORT, JSON.stringify(sort));
}
