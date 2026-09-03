export type ModalHierarchySectorGroupable = {
  sectorGroupId: string;
  sectorGroupName: string;
  displayName: string;
};

export type ModalHierarchyGroupedRow<T extends ModalHierarchySectorGroupable> =
  | { kind: 'group'; id: string; sectorGroupName: string }
  | { kind: 'item'; item: T };

function compareGroupedRows(
  a: ModalHierarchySectorGroupable,
  b: ModalHierarchySectorGroupable,
): number {
  const group = a.sectorGroupName.localeCompare(b.sectorGroupName, 'pt-BR', {
    sensitivity: 'base',
  });
  if (group !== 0) return group;

  return a.displayName.localeCompare(b.displayName, 'pt-BR', {
    sensitivity: 'base',
  });
}

export function groupModalHierarchyItemsBySector<
  T extends ModalHierarchySectorGroupable,
>(items: T[]): ModalHierarchyGroupedRow<T>[] {
  const sorted = [...items].sort(compareGroupedRows);
  const result: ModalHierarchyGroupedRow<T>[] = [];
  let lastGroupId = '';

  sorted.forEach((item) => {
    if (item.sectorGroupId !== lastGroupId) {
      lastGroupId = item.sectorGroupId;
      result.push({
        kind: 'group',
        id: `group:${item.sectorGroupId}`,
        sectorGroupName: item.sectorGroupName,
      });
    }
    result.push({ kind: 'item', item });
  });

  return result;
}
