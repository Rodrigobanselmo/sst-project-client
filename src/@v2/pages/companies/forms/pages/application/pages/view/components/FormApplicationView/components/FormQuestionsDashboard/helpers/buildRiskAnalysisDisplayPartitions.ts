import type { HierarchyGroupForRiskAnalysis } from './expandRiskAnalysisEntitiesForHierarchyGroups';

export type RiskAnalysisDisplayGroup = {
  group: HierarchyGroupForRiskAnalysis;
  memberEntityIds: string[];
};

export type RiskAnalysisDisplayPartitions = {
  groups: RiskAnalysisDisplayGroup[];
  ungrouped: string[];
};

/**
 * Separa setores elegíveis para um risco em blocos de agrupamento e setores isolados.
 * Um setor pertence a no máximo um agrupamento na lista retornada.
 */
export function buildRiskAnalysisDisplayPartitions(params: {
  entityIds: string[];
  hierarchyGroups: HierarchyGroupForRiskAnalysis[];
  entityMap: Record<string, { id: string; name: string }>;
}): RiskAnalysisDisplayPartitions {
  const { entityIds, hierarchyGroups, entityMap } = params;
  const entityIdSet = new Set(entityIds);
  const assignedEntityIds = new Set<string>();
  const groups: RiskAnalysisDisplayGroup[] = [];

  for (const group of hierarchyGroups) {
    const memberEntityIds = group.hierarchyIds
      .filter((hierarchyId) => entityIdSet.has(hierarchyId))
      .sort((a, b) =>
        (entityMap[a]?.name ?? a).localeCompare(
          entityMap[b]?.name ?? b,
          'pt-BR',
          { sensitivity: 'base' },
        ),
      );

    if (memberEntityIds.length === 0) continue;

    memberEntityIds.forEach((id) => assignedEntityIds.add(id));
    groups.push({ group, memberEntityIds });
  }

  const ungrouped = entityIds
    .filter((entityId) => !assignedEntityIds.has(entityId))
    .sort((a, b) =>
      (entityMap[a]?.name ?? a).localeCompare(
        entityMap[b]?.name ?? b,
        'pt-BR',
        { sensitivity: 'base' },
      ),
    );

  groups.sort((a, b) =>
    a.group.name.localeCompare(b.group.name, 'pt-BR', { sensitivity: 'base' }),
  );

  return { groups, ungrouped };
}

export function formatRiskAnalysisMemberLabel(params: {
  entityId: string;
  entityMap: Record<string, { name: string }>;
  entityEstablishmentMap?: Map<string, string> | Record<string, string>;
}): string {
  const sectorName = params.entityMap[params.entityId]?.name ?? params.entityId;
  const establishment =
    params.entityEstablishmentMap instanceof Map
      ? params.entityEstablishmentMap.get(params.entityId)
      : params.entityEstablishmentMap?.[params.entityId];

  return establishment ? `${establishment} / ${sectorName}` : sectorName;
}

export function sortMemberEntityIdsForDisplay(params: {
  memberEntityIds: string[];
  entityMap: Record<string, { name: string }>;
  entityEstablishmentMap?: Map<string, string> | Record<string, string>;
}): string[] {
  const getEstablishment = (entityId: string) =>
    params.entityEstablishmentMap instanceof Map
      ? params.entityEstablishmentMap.get(entityId) ?? ''
      : params.entityEstablishmentMap?.[entityId] ?? '';

  return [...params.memberEntityIds].sort((a, b) => {
    const byEstablishment = getEstablishment(a).localeCompare(
      getEstablishment(b),
      'pt-BR',
      { sensitivity: 'base' },
    );
    if (byEstablishment !== 0) return byEstablishment;

    return (params.entityMap[a]?.name ?? a).localeCompare(
      params.entityMap[b]?.name ?? b,
      'pt-BR',
      { sensitivity: 'base' },
    );
  });
}
