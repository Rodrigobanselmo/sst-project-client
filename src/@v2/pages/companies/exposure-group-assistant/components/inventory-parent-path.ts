export const INVENTORY_ELIGIBLE_PARENT_TYPES = [
  'DIRECTORY',
  'MANAGEMENT',
  'SECTOR',
  'SUB_SECTOR',
] as const;

export type InventoryEligibleParentType =
  (typeof INVENTORY_ELIGIBLE_PARENT_TYPES)[number];

export const INVENTORY_PARENT_LEVEL_RANK: Record<
  InventoryEligibleParentType,
  number
> = {
  DIRECTORY: 0,
  MANAGEMENT: 1,
  SECTOR: 2,
  SUB_SECTOR: 3,
};

export type InventoryParentPathItem = {
  id: string;
  name: string;
  type: string;
  parentId?: string | null;
};

export function indexParentsById<T extends InventoryParentPathItem>(
  parents: T[],
): Map<string, T> {
  return new Map(parents.map((parent) => [parent.id, parent]));
}

export type InventoryParentPathSegment = {
  name: string;
  type: string;
};

export const INVENTORY_PARENT_TYPE_MARK: Record<
  InventoryEligibleParentType,
  string
> = {
  DIRECTORY: 'D',
  MANAGEMENT: 'G',
  SECTOR: 'S',
  SUB_SECTOR: 'SS',
};

export const INVENTORY_PARENT_TYPE_LABEL: Record<
  InventoryEligibleParentType,
  string
> = {
  DIRECTORY: 'Diretoria',
  MANAGEMENT: 'Gerência',
  SECTOR: 'Setor',
  SUB_SECTOR: 'Subsetor',
};

export function parentTypeMark(type: string): string {
  return (
    INVENTORY_PARENT_TYPE_MARK[type as InventoryEligibleParentType] || type
  );
}

export function parentTypeLabel(type: string): string {
  return (
    INVENTORY_PARENT_TYPE_LABEL[type as InventoryEligibleParentType] || type
  );
}

export function buildInventoryParentPathSegments(
  parent: InventoryParentPathItem,
  byId: Map<string, InventoryParentPathItem>,
): InventoryParentPathSegment[] {
  const segments: InventoryParentPathSegment[] = [];
  const seen = new Set<string>();
  let current: InventoryParentPathItem | undefined = parent;

  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    segments.unshift({ name: current.name, type: current.type });
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return segments;
}

export function formatInventoryParentPathLabel(
  segments: InventoryParentPathSegment[],
): string {
  return segments
    .map((segment) => `[${parentTypeMark(segment.type)}] ${segment.name}`)
    .join(' > ');
}

export function buildInventoryParentPath(
  parent: InventoryParentPathItem,
  byId: Map<string, InventoryParentPathItem>,
): string {
  return formatInventoryParentPathLabel(
    buildInventoryParentPathSegments(parent, byId),
  );
}

export function filterParentsByMaxLevel<T extends { type: string }>(
  parents: T[],
  maxLevel: InventoryEligibleParentType,
): T[] {
  const maxRank = INVENTORY_PARENT_LEVEL_RANK[maxLevel];
  return parents.filter((parent) => {
    if (
      !INVENTORY_ELIGIBLE_PARENT_TYPES.includes(
        parent.type as InventoryEligibleParentType,
      )
    ) {
      return false;
    }
    return (
      INVENTORY_PARENT_LEVEL_RANK[parent.type as InventoryEligibleParentType] <=
      maxRank
    );
  });
}
