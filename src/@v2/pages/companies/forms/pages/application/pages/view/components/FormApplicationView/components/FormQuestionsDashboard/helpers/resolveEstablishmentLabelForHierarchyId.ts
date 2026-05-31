import { deriveSyntheticEstablishmentLabelFromSectorName } from './deriveSyntheticEstablishmentLabelFromSectorName';
import { resolveEstablishmentLabelFromSectorName } from './resolveEstablishmentLabelFromSectorName';

export function resolveEstablishmentLabelForHierarchyId(params: {
  hierarchyId: string;
  entityMap: Record<string, { id: string; name: string }>;
  hierarchyIdToWorkspaceName: Map<string, string>;
  applicationWorkspaceNames: string[];
}): string | null {
  const fromParticipants = params.hierarchyIdToWorkspaceName
    .get(params.hierarchyId)
    ?.trim();
  if (fromParticipants) return fromParticipants;

  const sectorName = params.entityMap[params.hierarchyId]?.name;
  if (!sectorName) return null;

  const fromWorkspaceList = resolveEstablishmentLabelFromSectorName(
    sectorName,
    params.applicationWorkspaceNames,
  );
  if (fromWorkspaceList) return fromWorkspaceList;

  return deriveSyntheticEstablishmentLabelFromSectorName(sectorName);
}
