export type HierarchyGroupForRiskAnalysis = {
  id: string;
  name: string;
  hierarchyIds: string[];
};

export type EntityRiskMapForExpansion = Record<
  string,
  Record<string, { values: number[]; probability: number }> | undefined
>;

export type GroupedEntityRiskMapForExpansion = Record<
  string,
  Record<string, { values: number[]; probability: number }> | undefined
>;

/**
 * Setores com dado próprio do risco no recorte, mais membros do mesmo agrupamento
 * quando o grupo materializa o risco (via dado individual ou groupedEntityRiskMap).
 *
 * - Se algum membro visível tem dado próprio do risco: expande os demais membros
 *   do mesmo agrupamento que também estejam no recorte (`isEntityVisible`).
 * - Se o risco vem só do agrupamento agregado: expande apenas membros visíveis.
 * - A expansão nunca ultrapassa o recorte estrutural selecionado (Estabelecimento/Setor).
 */
export function expandRiskAnalysisEntitiesForHierarchyGroups(params: {
  riskId: string;
  entityRiskMap: EntityRiskMapForExpansion;
  groupedEntityRiskMap?: GroupedEntityRiskMapForExpansion;
  entityMap: Record<string, { id: string; name: string }>;
  hierarchyGroups: HierarchyGroupForRiskAnalysis[];
  isEntityVisible: (entityId: string) => boolean;
}): string[] {
  const {
    riskId,
    entityRiskMap,
    groupedEntityRiskMap,
    entityMap,
    hierarchyGroups,
    isEntityVisible,
  } = params;

  const entityIds = new Set<string>();

  for (const entityId of Object.keys(entityRiskMap)) {
    if (entityRiskMap[entityId]?.[riskId] && isEntityVisible(entityId)) {
      entityIds.add(entityId);
    }
  }

  for (const group of hierarchyGroups) {
    const groupHasSelectedMember = group.hierarchyIds.some((hierarchyId) =>
      isEntityVisible(hierarchyId),
    );
    if (!groupHasSelectedMember) continue;

    const groupHasAggregatedRisk = Boolean(
      groupedEntityRiskMap?.[group.id]?.[riskId],
    );
    const groupHasMemberWithDirectRisk = group.hierarchyIds.some((hierarchyId) =>
      Boolean(entityRiskMap[hierarchyId]?.[riskId]),
    );

    if (!groupHasAggregatedRisk && !groupHasMemberWithDirectRisk) continue;

    for (const hierarchyId of group.hierarchyIds) {
      if (!entityMap[hierarchyId]) continue;
      if (!isEntityVisible(hierarchyId)) continue;
      entityIds.add(hierarchyId);
    }
  }

  return Array.from(entityIds).sort((a, b) =>
    (entityMap[a]?.name ?? '').localeCompare(
      entityMap[b]?.name ?? '',
      'pt-BR',
      { sensitivity: 'base' },
    ),
  );
}
