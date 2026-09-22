import { HomoTypeEnum } from 'core/enums/homo-type.enum';

type RouteQueryValue = string | string[] | undefined;

/**
 * Campos de workspace/type no POST /risk-data a partir do contexto do RiskTool.
 *
 * - HIERARCHY: comportamento legado — type + workspaceId embutido no id da árvore
 *   (mesmo se undefined). Não usa tabWorkspaceId.
 * - Demais (Caracterização/GSE/…): workspaceId explícito no payload parcial, senão
 *   rota (path workspaceId || tabWorkspaceId). Sem contexto → omite a chave.
 *
 * Não resolve por GHO / company.workspace[0].
 */
export function buildRiskDataUpsertWorkspaceFields(params: {
  isHierarchy: boolean;
  /** Workspace embutido em `hierarchyId//workspaceId` (fluxo HIERARCHY). */
  hierarchyWorkspaceId?: string;
  /** Já presente no partial (prioridade em fluxos não-hierarquia). */
  explicitWorkspaceId?: string;
  routeWorkspaceId?: RouteQueryValue;
  tabWorkspaceId?: RouteQueryValue;
}): { type?: HomoTypeEnum; workspaceId?: string } {
  if (params.isHierarchy) {
    return {
      type: HomoTypeEnum.HIERARCHY,
      workspaceId: params.hierarchyWorkspaceId,
    };
  }

  const pick = (value?: RouteQueryValue): string | undefined => {
    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === 'string' && item);
      return first || undefined;
    }
    return value || undefined;
  };

  const workspaceId =
    (typeof params.explicitWorkspaceId === 'string' &&
    params.explicitWorkspaceId
      ? params.explicitWorkspaceId
      : undefined) ||
    pick(params.routeWorkspaceId) ||
    pick(params.tabWorkspaceId);

  return workspaceId ? { workspaceId } : {};
}
