import { ClinicsListSortBy, ClinicsTableColumnId } from './clinicsTable.types';

const KEY_PAGE_SIZE = 'CLINICS_TABLE_PAGE_SIZE';
const KEY_HIDDEN = 'CLINICS_TABLE_HIDDEN_COLUMNS';
const KEY_SORT = 'CLINICS_TABLE_SORT';

export const CLINICS_TABLE_PAGE_SIZES = [15, 25, 50, 100] as const;

export const DEFAULT_CLINICS_PAGE_SIZE = 15;

export function isAllowedClinicsPageSize(n: number): boolean {
  return (CLINICS_TABLE_PAGE_SIZES as readonly number[]).includes(n);
}

export function loadClinicsPageSize(): number {
  try {
    const raw = localStorage.getItem(KEY_PAGE_SIZE);
    if (!raw) return DEFAULT_CLINICS_PAGE_SIZE;
    const n = Number(JSON.parse(raw));
    return isAllowedClinicsPageSize(n) ? n : DEFAULT_CLINICS_PAGE_SIZE;
  } catch {
    return DEFAULT_CLINICS_PAGE_SIZE;
  }
}

export function saveClinicsPageSize(n: number): void {
  if (!isAllowedClinicsPageSize(n)) return;
  localStorage.setItem(KEY_PAGE_SIZE, JSON.stringify(n));
}

export function loadClinicsHiddenColumns(): Partial<
  Record<ClinicsTableColumnId, boolean>
> {
  try {
    const raw = localStorage.getItem(KEY_HIDDEN);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveClinicsHiddenColumns(
  hidden: Partial<Record<ClinicsTableColumnId, boolean>>,
): void {
  localStorage.setItem(KEY_HIDDEN, JSON.stringify(hidden));
}

export type StoredClinicsSort = {
  field: ClinicsListSortBy;
  order: 'asc' | 'desc';
};

export function loadClinicsSort(): StoredClinicsSort | null {
  try {
    const raw = localStorage.getItem(KEY_SORT);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredClinicsSort;
    if (!v?.field || !v?.order) return null;
    return v;
  } catch {
    return null;
  }
}

export function saveClinicsSort(sort: StoredClinicsSort | null): void {
  if (!sort) {
    localStorage.removeItem(KEY_SORT);
    return;
  }
  localStorage.setItem(KEY_SORT, JSON.stringify(sort));
}
