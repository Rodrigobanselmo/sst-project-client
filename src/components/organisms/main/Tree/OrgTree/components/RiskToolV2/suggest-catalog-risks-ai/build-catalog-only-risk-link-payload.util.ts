import { HomoTypeEnum } from 'core/enums/homo-type.enum';

/**
 * Payload mínimo de vínculo (mesmo padrão de "Adicionar riscos"):
 * keepEmpty + riskIds + homogeneousGroupIds. Sem probabilidade/controles.
 */
export function buildCatalogOnlyRiskLinkPayload(params: {
  riskGroupId: string;
  entityId: string;
  selectedRiskIds: string[];
  workspaceId?: string;
  isHierarchy?: boolean;
}) {
  const riskIds = [...new Set(params.selectedRiskIds.filter(Boolean))];
  if (!riskIds.length) return null;

  return {
    keepEmpty: true as const,
    homogeneousGroupIds: [params.entityId],
    riskIds,
    riskFactorGroupDataId: params.riskGroupId,
    ...(params.workspaceId ? { workspaceId: params.workspaceId } : {}),
    ...(params.isHierarchy ? { type: HomoTypeEnum.HIERARCHY } : {}),
  };
}

export function intersectSuggestedRiskIdsWithCatalog(params: {
  suggestedIds: string[];
  catalogIds: Set<string>;
}): string[] {
  return params.suggestedIds.filter((id) => params.catalogIds.has(id));
}
