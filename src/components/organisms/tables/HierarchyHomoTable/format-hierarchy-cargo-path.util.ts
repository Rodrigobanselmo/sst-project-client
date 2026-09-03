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

export function hierarchyNamesAreVisuallyEqual(
  a?: string,
  b?: string,
): boolean {
  const left = (a || '').trim();
  const right = (b || '').trim();
  if (!left || !right) return false;
  return left.localeCompare(right, 'pt-BR', { sensitivity: 'base' }) === 0;
}

/**
 * Apresentação da aba Cargos do Elemento Caracterizável:
 * cabeçalho = SECTOR; linha = CARGO, ou SUB_SECTOR > CARGO só se o subsetor
 * for estruturalmente distinto (nome diferente do setor).
 */
export function formatCharacterizationSectorGroupedRow(row: {
  name?: string;
  type?: string;
  id?: string | number;
  parents?: (HierarchyPathNode & { id?: string | number })[];
}): {
  sectorGroupId: string;
  sectorGroupName: string;
  sectorName: string;
  subSectorName: string;
  cargoName: string;
  displayName: string;
} {
  const cargoName = (row.name || '').trim() || '-';
  const sector = row.parents?.find((parent) => parent.type === 'SECTOR');
  const subSector = row.parents?.find((parent) => parent.type === 'SUB_SECTOR');
  const sectorName = (sector?.name || '').trim();
  const subSectorName = (subSector?.name || '').trim();
  const sectorGroupName = sectorName || 'Sem setor';
  const sectorGroupId = String(sector?.id || sectorName || 'ungrouped-workspace');

  const showDistinctSubSector =
    !!subSectorName && !hierarchyNamesAreVisuallyEqual(subSectorName, sectorName);

  return {
    sectorGroupId,
    sectorGroupName,
    sectorName,
    subSectorName,
    cargoName,
    displayName: showDistinctSubSector
      ? `${subSectorName} > ${cargoName}`
      : cargoName,
  };
}
