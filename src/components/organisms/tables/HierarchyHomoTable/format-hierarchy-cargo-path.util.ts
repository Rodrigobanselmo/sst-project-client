type HierarchyPathNode = {
  name?: string;
  type?: string;
};

export function formatHierarchySectorCargoLabel(row: {
  name?: string;
  type?: string;
  parents?: HierarchyPathNode[];
}): {
  sectorName: string;
  cargoName: string;
  displayName: string;
} {
  const cargoName = (row.name || '').trim() || '-';
  const sector = row.parents?.find((parent) => parent.type === 'SECTOR');
  const subSector = row.parents?.find((parent) => parent.type === 'SUB_SECTOR');
  const parts = [sector?.name, subSector?.name].filter(Boolean) as string[];
  const sectorName = parts.join(' > ');
  const displayName = sectorName ? `${sectorName} > ${cargoName}` : cargoName;

  return { sectorName, cargoName, displayName };
}

export function formatHierarchyFullContextLabel(params: {
  workspaceName?: string;
  sectorName?: string;
  cargoName?: string;
}): string {
  return [params.workspaceName, params.sectorName, params.cargoName]
    .map((part) => (part || '').trim())
    .filter(Boolean)
    .join(' > ');
}
