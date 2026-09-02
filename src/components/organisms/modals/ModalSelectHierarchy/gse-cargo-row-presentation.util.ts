type HierarchyPathNode = {
  name?: string;
  type?: string;
};

export function getGseCargoRowPresentation(params: {
  workspaceName?: string;
  cargoName?: string;
  parents?: HierarchyPathNode[];
}): {
  cargoName: string;
  workspaceTooltip: string;
  sectorTooltip: string;
  sectorName: string;
  subSectorName: string;
} {
  const cargoName = (params.cargoName || '').trim() || '-';
  const sectorName =
    params.parents?.find((parent) => parent.type === 'SECTOR')?.name?.trim() ||
    '';
  const subSectorName =
    params.parents
      ?.find((parent) => parent.type === 'SUB_SECTOR')
      ?.name?.trim() || '';
  const workspaceName = (params.workspaceName || '').trim() || '-';

  const sectorLines = [`Setor: ${sectorName || '-'}`];
  if (subSectorName) sectorLines.push(`Subsetor: ${subSectorName}`);

  return {
    cargoName,
    sectorName,
    subSectorName,
    workspaceTooltip: `Estabelecimento: ${workspaceName}`,
    sectorTooltip: sectorLines.join('\n'),
  };
}

/** Badge “Cargo” do modal GSE: light igual ao atual; dark com contraste legível. */
export function getGseCargoBadgeSx(mode?: string): {
  backgroundColor: string;
  color?: string;
  border?: string;
  borderColor?: string;
} {
  if (mode === 'dark') {
    return {
      backgroundColor: 'gray.700',
      color: 'text.main',
      border: '1px solid',
      borderColor: 'background.border',
    };
  }

  return { backgroundColor: 'gray.200' };
}
