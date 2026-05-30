import { FORM_PARTICIPANT_NO_ESTABLISHMENT_LABEL } from '@v2/models/form/helpers/form-participants-aggregate-by-establishment';
import type { StructuralIndicatorGroupingKey } from '@v2/models/form/helpers/form-indicators-structural-grouping.config';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';

import type {
  HierarchyGroupForIndicators,
  ParticipantGroupForIndicators,
} from './buildParticipantGroupsForIndicators';
import { resolveEstablishmentLabelForHierarchyId } from './resolveEstablishmentLabelForHierarchyId';

const STRUCTURAL_KEY_PREFIX = '__structural__';

function structuralSectorGroupId(hierarchyId: string): string {
  return `${STRUCTURAL_KEY_PREFIX}__participant_sector::${HierarchyTypeEnum.SECTOR}::${hierarchyId}`;
}

function structuralWorkspaceGroupId(workspaceId: string): string {
  return `${STRUCTURAL_KEY_PREFIX}__participant_workspace::${workspaceId}`;
}

function resolveWorkspaceGroupFromLabel(
  establishmentLabel: string,
  applicationWorkspaces: { id: string; name: string }[],
): { id: string; name: string } {
  const normalizedLabel = establishmentLabel.trim();
  const matched =
    applicationWorkspaces.find((workspace) => workspace.name.trim() === normalizedLabel) ??
    applicationWorkspaces.find(
      (workspace) =>
        workspace.name.trim().localeCompare(normalizedLabel, 'pt-BR', {
          sensitivity: 'base',
        }) === 0,
    );

  if (matched) {
    return {
      id: structuralWorkspaceGroupId(matched.id),
      name: matched.name.trim(),
    };
  }

  return {
    id: structuralWorkspaceGroupId(`__name__${normalizedLabel}`),
    name: normalizedLabel,
  };
}

function collectHierarchyIdsFromGroups(
  hierarchyGroups: HierarchyGroupForIndicators[],
): string[] {
  const ids = new Set<string>();
  hierarchyGroups.forEach((group) => {
    group.hierarchyIds.forEach((hierarchyId) => ids.add(hierarchyId));
  });
  return Array.from(ids);
}

export function expandStructuralParticipantGroupsFromHierarchyGroups(params: {
  groups: ParticipantGroupForIndicators[];
  groupingKey: StructuralIndicatorGroupingKey;
  hierarchyGroups: HierarchyGroupForIndicators[];
  entityMap: Record<string, { id: string; name: string }>;
  hierarchyIdToWorkspaceName: Map<string, string>;
  applicationWorkspaces: { id: string; name: string }[];
  applicationWorkspaceNames: string[];
}): ParticipantGroupForIndicators[] {
  const {
    groups,
    groupingKey,
    hierarchyGroups,
    entityMap,
    hierarchyIdToWorkspaceName,
    applicationWorkspaces,
    applicationWorkspaceNames,
  } = params;

  if (hierarchyGroups.length === 0) return groups;

  const groupsMap = new Map<string, ParticipantGroupForIndicators>();
  groups.forEach((group) =>
    groupsMap.set(group.id, {
      ...group,
      participantIds: new Set(group.participantIds),
    }),
  );

  const hierarchyIds = collectHierarchyIdsFromGroups(hierarchyGroups);

  if (groupingKey === '__participant_sector') {
    for (const hierarchyId of hierarchyIds) {
      const entity = entityMap[hierarchyId];
      if (!entity?.name) continue;

      const groupId = structuralSectorGroupId(hierarchyId);
      if (groupsMap.has(groupId)) continue;

      groupsMap.set(groupId, {
        id: groupId,
        name: entity.name,
        participantIds: new Set(),
      });
    }
  }

  if (groupingKey === '__participant_workspace') {
    for (const hierarchyId of hierarchyIds) {
      const establishmentLabel = resolveEstablishmentLabelForHierarchyId({
        hierarchyId,
        entityMap,
        hierarchyIdToWorkspaceName,
        applicationWorkspaceNames,
      });

      if (
        !establishmentLabel ||
        establishmentLabel === FORM_PARTICIPANT_NO_ESTABLISHMENT_LABEL
      ) {
        continue;
      }

      const workspaceGroup = resolveWorkspaceGroupFromLabel(
        establishmentLabel,
        applicationWorkspaces,
      );

      if (groupsMap.has(workspaceGroup.id)) continue;

      groupsMap.set(workspaceGroup.id, {
        id: workspaceGroup.id,
        name: workspaceGroup.name,
        participantIds: new Set(),
      });
    }
  }

  return Array.from(groupsMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
  );
}
