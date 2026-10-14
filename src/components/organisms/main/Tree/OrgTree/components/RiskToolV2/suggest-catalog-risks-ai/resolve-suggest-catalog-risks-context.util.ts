import { ViewsDataEnum } from '../utils/view-data-type.constant';

export type SuggestCatalogRisksContextKind = 'gse' | 'characterization';

export type SuggestCatalogRisksContext = {
  kind: SuggestCatalogRisksContextKind;
  companyId: string;
  workspaceId: string;
  entityId: string;
  riskGroupId: string;
};

function firstQueryString(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value.find(Boolean);
  return value || undefined;
}

/**
 * Resolve o contexto do botão "Sugerir riscos com IA" a partir da view
 * do RiskTool e dos IDs disponíveis (sem misturar GSE e Elemento).
 */
export function resolveSuggestCatalogRisksContext(params: {
  viewDataType: ViewsDataEnum;
  companyId?: string;
  riskGroupId?: string;
  selectedEntityId?: string | null;
  routeWorkspaceId?: string | string[];
  tabWorkspaceId?: string | string[];
  entityWorkspaceIds?: string[] | null;
}): SuggestCatalogRisksContext | null {
  const companyId = params.companyId?.trim();
  const riskGroupId = params.riskGroupId?.trim();
  const entityId = String(params.selectedEntityId || '')
    .split('//')[0]
    ?.trim();

  if (!companyId || !riskGroupId || !entityId) return null;

  let kind: SuggestCatalogRisksContextKind | null = null;
  if (params.viewDataType === ViewsDataEnum.GSE) kind = 'gse';
  if (params.viewDataType === ViewsDataEnum.CHARACTERIZATION) {
    kind = 'characterization';
  }
  if (!kind) return null;

  const fromEntitySplit = String(params.selectedEntityId || '').split('//')[1];
  const workspaceId =
    firstQueryString(params.tabWorkspaceId) ||
    firstQueryString(params.routeWorkspaceId) ||
    (params.entityWorkspaceIds || []).find(Boolean) ||
    fromEntitySplit ||
    '';

  if (!workspaceId) return null;

  return {
    kind,
    companyId,
    workspaceId,
    entityId,
    riskGroupId,
  };
}
