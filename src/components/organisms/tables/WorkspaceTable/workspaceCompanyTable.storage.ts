import {
  WorkspaceCompanyColumnId,
  WorkspaceCompanySortBy,
} from './workspaceCompanyTable.types';

const KEY_PAGE_SIZE = 'WORKSPACE_COMPANY_TABLE_PAGE_SIZE';
const KEY_HIDDEN = 'WORKSPACE_COMPANY_TABLE_HIDDEN_COLUMNS';
const KEY_SORT = 'WORKSPACE_COMPANY_TABLE_SORT';

export const WORKSPACE_COMPANY_TABLE_PAGE_SIZES = [15, 25, 50, 100] as const;

export const DEFAULT_WORKSPACE_COMPANY_PAGE_SIZE = 15;

export function isAllowedWorkspaceCompanyPageSize(n: number): boolean {
  return (WORKSPACE_COMPANY_TABLE_PAGE_SIZES as readonly number[]).includes(n);
}

export function loadWorkspaceCompanyPageSize(): number {
  try {
    const raw = localStorage.getItem(KEY_PAGE_SIZE);
    if (!raw) return DEFAULT_WORKSPACE_COMPANY_PAGE_SIZE;
    const n = Number(JSON.parse(raw));
    return isAllowedWorkspaceCompanyPageSize(n)
      ? n
      : DEFAULT_WORKSPACE_COMPANY_PAGE_SIZE;
  } catch {
    return DEFAULT_WORKSPACE_COMPANY_PAGE_SIZE;
  }
}

export function saveWorkspaceCompanyPageSize(n: number): void {
  if (!isAllowedWorkspaceCompanyPageSize(n)) return;
  localStorage.setItem(KEY_PAGE_SIZE, JSON.stringify(n));
}

export function loadWorkspaceCompanyHiddenColumns(): Partial<
  Record<WorkspaceCompanyColumnId, boolean>
> {
  try {
    const raw = localStorage.getItem(KEY_HIDDEN);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveWorkspaceCompanyHiddenColumns(
  hidden: Partial<Record<WorkspaceCompanyColumnId, boolean>>,
): void {
  localStorage.setItem(KEY_HIDDEN, JSON.stringify(hidden));
}

export type StoredWorkspaceCompanySort = {
  field: WorkspaceCompanySortBy;
  order: 'asc' | 'desc';
};

export function loadWorkspaceCompanySort(): StoredWorkspaceCompanySort | null {
  try {
    const raw = localStorage.getItem(KEY_SORT);
    if (!raw) return null;
    const v = JSON.parse(raw) as StoredWorkspaceCompanySort;
    if (!v?.field || !v?.order) return null;
    return v;
  } catch {
    return null;
  }
}

export function saveWorkspaceCompanySort(
  sort: StoredWorkspaceCompanySort | null,
): void {
  if (!sort) {
    localStorage.removeItem(KEY_SORT);
    return;
  }
  localStorage.setItem(KEY_SORT, JSON.stringify(sort));
}
