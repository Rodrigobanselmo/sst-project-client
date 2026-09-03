import { IListHierarchyQuery } from 'core/hooks/useListHierarchyQuery';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { formatCharacterizationSectorGroupedRow } from 'components/organisms/tables/HierarchyHomoTable/format-hierarchy-cargo-path.util';

import { getGseCargoRowPresentation } from './gse-cargo-row-presentation.util';

export function hierarchyMatchesSectorGroupedSearch(
  hierarchy: {
    name?: string;
    parents?: { name?: string; type?: string }[];
  },
  search: string,
  options?: { includeSectorPath?: boolean },
): boolean {
  const needle = stringNormalize(search);
  if (!needle) return true;
  if (stringNormalize(hierarchy.name).includes(needle)) return true;
  if (!options?.includeSectorPath) return false;

  const sectorName =
    hierarchy.parents?.find((parent) => parent.type === 'SECTOR')?.name || '';
  const subSectorName =
    hierarchy.parents?.find((parent) => parent.type === 'SUB_SECTOR')?.name ||
    '';

  return (
    stringNormalize(sectorName).includes(needle) ||
    stringNormalize(subSectorName).includes(needle)
  );
}

export type SectorGroupedCargoModalRow = IListHierarchyQuery & {
  sectorGroupId: string;
  sectorGroupName: string;
  sectorName: string;
  subSectorName: string;
  cargoName: string;
  displayName: string;
  sectorTooltip: string;
  workspaceTooltip?: string;
};

export type CharacterizationCargoModalRow = SectorGroupedCargoModalRow;

export function toSectorGroupedCargoModalRow(
  hierarchy: IListHierarchyQuery,
  options?: { workspaceName?: string },
): SectorGroupedCargoModalRow {
  const grouped = formatCharacterizationSectorGroupedRow(hierarchy);
  const presentation = getGseCargoRowPresentation({
    workspaceName: options?.workspaceName || '',
    cargoName: hierarchy.name,
    parents: hierarchy.parents,
  });

  return {
    ...hierarchy,
    ...grouped,
    sectorTooltip: presentation.sectorTooltip,
    workspaceTooltip: options?.workspaceName
      ? presentation.workspaceTooltip
      : undefined,
  };
}

export function toCharacterizationCargoModalRow(
  hierarchy: IListHierarchyQuery,
): CharacterizationCargoModalRow {
  return toSectorGroupedCargoModalRow(hierarchy);
}
