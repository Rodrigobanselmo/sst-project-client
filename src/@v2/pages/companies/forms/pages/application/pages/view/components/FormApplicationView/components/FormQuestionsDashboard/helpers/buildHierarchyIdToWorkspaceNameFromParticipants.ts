import type { FormParticipantsBrowseResultModel } from '@v2/models/form/models/form-participants/form-participants-browse-result.model';

/**
 * Mapeia hierarchyId → workspaceName a partir dos participantes alocados na aplicação
 * (inclui quem ainda não respondeu). Em empate, usa o menor nome (pt-BR).
 */
export function buildHierarchyIdToWorkspaceNameFromParticipants(
  participants: FormParticipantsBrowseResultModel[],
): Map<string, string> {
  const map = new Map<string, string>();

  for (const participant of participants) {
    const workspaceName = participant.workspaceName?.trim();
    if (!workspaceName) continue;

    const hierarchyIds = new Set<string>();
    if (participant.hierarchyId) {
      hierarchyIds.add(participant.hierarchyId);
    }
    participant.hierarchies.forEach((hierarchy) => {
      hierarchyIds.add(hierarchy.id);
    });

    hierarchyIds.forEach((hierarchyId) => {
      const existing = map.get(hierarchyId);
      if (!existing) {
        map.set(hierarchyId, workspaceName);
        return;
      }
      if (
        workspaceName.localeCompare(existing, 'pt-BR', { sensitivity: 'base' }) <
        0
      ) {
        map.set(hierarchyId, workspaceName);
      }
    });
  }

  return map;
}
