import { compareWorkspaceGroupOrder } from './resolve-hierarchy-workspace-group.util';

export type HierarchyHomoGroupableRow = {
  id?: string | number;
  endDate?: Date | string | null;
  workspaceGroupId: string;
  workspaceGroupName: string;
  sectorName: string;
  cargoName: string;
};

export type HierarchyHomoGroupedRow<T extends HierarchyHomoGroupableRow> =
  | { kind: 'group'; id: string; workspaceGroupName: string }
  | (T & { kind: 'cargo' });

function compareCargoRows(
  a: HierarchyHomoGroupableRow,
  b: HierarchyHomoGroupableRow,
): number {
  const sector = a.sectorName.localeCompare(b.sectorName, 'pt-BR', {
    sensitivity: 'base',
  });
  if (sector !== 0) return sector;

  const cargo = a.cargoName.localeCompare(b.cargoName, 'pt-BR', {
    sensitivity: 'base',
  });
  if (cargo !== 0) return cargo;

  const aEnded = a.endDate ? 1 : 0;
  const bEnded = b.endDate ? 1 : 0;
  if (aEnded !== bEnded) return aEnded - bEnded;

  return String(a.id || '').localeCompare(String(b.id || ''));
}

export function sortHierarchyHomoRowsByWorkspaceGroup<
  T extends HierarchyHomoGroupableRow,
>(rows: T[], preferredWorkspaceId?: string): T[] {
  return [...rows].sort((a, b) => {
    const group = compareWorkspaceGroupOrder({
      aGroupId: a.workspaceGroupId,
      bGroupId: b.workspaceGroupId,
      aName: a.workspaceGroupName,
      bName: b.workspaceGroupName,
      preferredWorkspaceId,
    });
    if (group !== 0) return group;
    return compareCargoRows(a, b);
  });
}

export function insertEstablishmentSectorHeaders<
  T extends HierarchyHomoGroupableRow & {
    sectorGroupId: string;
    sectorGroupName: string;
  },
>(
  rows: T[],
): (
  | { kind: 'group'; id: string; workspaceGroupName: string }
  | { kind: 'sector'; id: string; sectorGroupName: string }
  | (T & { kind: 'cargo' })
)[] {
  const result: (
    | { kind: 'group'; id: string; workspaceGroupName: string }
    | { kind: 'sector'; id: string; sectorGroupName: string }
    | (T & { kind: 'cargo' })
  )[] = [];
  let lastWorkspaceId = '';
  let lastSectorKey = '';

  rows.forEach((row) => {
    if (row.workspaceGroupId !== lastWorkspaceId) {
      lastWorkspaceId = row.workspaceGroupId;
      lastSectorKey = '';
      result.push({
        kind: 'group',
        id: `group:${row.workspaceGroupId}`,
        workspaceGroupName: row.workspaceGroupName,
      });
    }

    const sectorKey = `${row.workspaceGroupId}//${row.sectorGroupId}`;
    if (sectorKey !== lastSectorKey) {
      lastSectorKey = sectorKey;
      result.push({
        kind: 'sector',
        id: `sector:${sectorKey}`,
        sectorGroupName: row.sectorGroupName,
      });
    }

    result.push({ ...row, kind: 'cargo' });
  });

  return result;
}

export function insertWorkspaceGroupHeaders<T extends HierarchyHomoGroupableRow>(
  rows: T[],
): HierarchyHomoGroupedRow<T>[] {
  const result: HierarchyHomoGroupedRow<T>[] = [];
  let lastGroupId = '';

  rows.forEach((row) => {
    if (row.workspaceGroupId !== lastGroupId) {
      lastGroupId = row.workspaceGroupId;
      result.push({
        kind: 'group',
        id: `group:${row.workspaceGroupId}`,
        workspaceGroupName: row.workspaceGroupName,
      });
    }
    result.push({ ...row, kind: 'cargo' });
  });

  return result;
}
