import type { ExistingRiskReview } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import type { IRiskData } from 'core/interfaces/api/IRiskData';
import { ViewsDataEnum } from '../utils/view-data-type.constant';

export const HIERARCHY_AI_TYPES = [
  'DIRECTORY',
  'MANAGEMENT',
  'SECTOR',
  'SUB_SECTOR',
  'OFFICE',
  'SUB_OFFICE',
];

export type RiskLinkageAiContext = {
  kind: 'gse' | 'characterization' | 'hierarchy';
  hierarchyType?: string;
  companyId: string;
  workspaceId: string;
  entityId: string;
  riskGroupId: string;
};

type Entity = {
  id: string;
  companyId: string;
  type?: string | number | null;
  status?: string;
  deletedAt?: unknown;
  workspaceIds?: string[];
  workspaces?: Array<{ id: string }>;
  characterization?: { id: string };
};
export type RiskLinkageAiOccurrence = Pick<
  IRiskData,
  | 'id'
  | 'riskId'
  | 'companyId'
  | 'homogeneousGroupId'
  | 'riskFactorGroupDataId'
  | 'workspaceId'
  | 'hierarchyId'
  | 'isDirect'
  | 'canEditOnThisEntity'
  | 'originKind'
  | 'originId'
  | 'resolutionSource'
> & {
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  deletedAt?: unknown;
};

export type RiskFactorAiOccurrenceScope = {
  context: RiskLinkageAiContext;
  rows: readonly RiskLinkageAiOccurrence[];
};

export function resolveRiskLinkageAiContext(params: {
  viewData: string;
  companyId: string;
  riskGroupId: string;
  selectedEntityId?: string;
  workspaceId?: string;
  routeWorkspaceId?: string;
  entities: readonly Entity[];
  hierarchies?: readonly Entity[];
}): { context: RiskLinkageAiContext | null; message?: string } {
  const { companyId, riskGroupId } = params;
  if (
    params.viewData !== ViewsDataEnum.GSE &&
    params.viewData !== ViewsDataEnum.CHARACTERIZATION &&
    params.viewData !== ViewsDataEnum.HIERARCHY
  )
    return { context: null };
  const entityId = (params.selectedEntityId || '').split('//')[0];
  if (!entityId) return { context: null };
  const isHierarchy = params.viewData === ViewsDataEnum.HIERARCHY;
  const entity = (
    isHierarchy ? params.hierarchies || [] : params.entities
  ).find((item) => item.id === entityId && item.companyId === companyId);
  if (
    !companyId ||
    !riskGroupId ||
    !entity ||
    entity.deletedAt ||
    (entity.status && entity.status !== 'ACTIVE')
  ) {
    return {
      context: null,
      message:
        'Não foi possível validar a entidade para a análise com IA. Selecione uma entidade ativa.',
    };
  }
  const kind = isHierarchy
    ? 'hierarchy'
    : params.viewData === ViewsDataEnum.GSE
      ? 'gse'
      : 'characterization';
  const validType =
    kind === 'hierarchy'
      ? HIERARCHY_AI_TYPES.includes(String(entity.type))
      : kind === 'gse'
        ? entity.type == null || entity.type === ''
        : ['ENVIRONMENT', 'ACTIVITIES', 'EQUIPMENT', 'WORKSTATION'].includes(
            String(entity.type),
          ) && entity.characterization?.id === entity.id;
  if (!validType)
    return {
      context: null,
      message:
        'Selecione um GSE, elemento caracterizado ou nível hierárquico compatível.',
    };
  const workspaceId = params.workspaceId;
  const linked = new Set([
    ...(entity.workspaceIds || []),
    ...(entity.workspaces || []).map((item) => item.id),
  ]);
  if (
    !workspaceId ||
    !linked.has(workspaceId) ||
    (isHierarchy &&
      params.selectedEntityId?.includes('//') &&
      params.selectedEntityId.split('//')[1] !== workspaceId) ||
    (params.routeWorkspaceId && params.routeWorkspaceId !== workspaceId)
  ) {
    return {
      context: null,
      message:
        'Selecione um estabelecimento válido e vinculado à entidade para analisar os fatores de risco com IA.',
    };
  }
  return {
    context: {
      kind,
      companyId,
      workspaceId,
      entityId,
      riskGroupId,
      ...(isHierarchy ? { hierarchyType: String(entity.type) } : {}),
    },
  };
}

export function riskLinkageAiContextKey(context: RiskLinkageAiContext): string {
  return JSON.stringify([
    context.companyId,
    context.workspaceId,
    context.kind,
    context.entityId,
    context.riskGroupId,
    ...(context.kind === 'hierarchy' ? [context.hierarchyType] : []),
  ]);
}

/** A new occurrence must never inherit the pending/accepted keys of a replaced row. */
export function riskLinkageAiOccurrenceSignature(
  rows: readonly RiskLinkageAiOccurrence[],
): string {
  return JSON.stringify(
    rows
      .map((row) => [
        row.id,
        row.riskId,
        row.companyId,
        row.homogeneousGroupId,
        row.riskFactorGroupDataId,
      ])
      .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
  );
}

export function canAnalyzeRiskLinkageOccurrence(
  scope: RiskFactorAiOccurrenceScope,
  riskId?: string,
  occurrenceId?: string,
  now = Date.now(),
): boolean {
  if (!riskId || !occurrenceId) return false;
  // Includes historical rows: the unchanged API cannot select between duplicates by RFD id.
  const matches = scope.rows.filter((row) => row.riskId === riskId);
  if (matches.length !== 1) return false;
  const row = matches[0];
  const { context } = scope;
  return (
    row.id === occurrenceId &&
    row.companyId === context.companyId &&
    row.homogeneousGroupId === context.entityId &&
    row.riskFactorGroupDataId === context.riskGroupId &&
    (!row.workspaceId || row.workspaceId === context.workspaceId) &&
    (context.kind === 'hierarchy'
      ? !row.hierarchyId || row.hierarchyId === context.entityId
      : !row.hierarchyId) &&
    !row.endDate &&
    !row.deletedAt &&
    row.isDirect !== false &&
    row.canEditOnThisEntity !== false &&
    (!row.startDate ||
      (Number.isFinite(new Date(row.startDate).getTime()) &&
        new Date(row.startDate).getTime() <= now)) &&
    (!row.originId || row.originId === context.entityId) &&
    (!row.originKind ||
      row.originKind ===
        (context.kind === 'hierarchy'
          ? 'HIERARCHY'
          : context.kind === 'gse'
            ? 'GSE'
            : 'CHARACTERIZATION')) &&
    (!row.resolutionSource ||
      row.resolutionSource === 'GSE_OWN_RISKS' ||
      (context.kind === 'hierarchy' &&
        row.resolutionSource === 'HIERARCHY_OWN_RISKS'))
  );
}

/** Validate both the authoritative list and the row actually being rendered/accepted. */
export function canUseRiskLinkageRow(
  scope: RiskFactorAiOccurrenceScope,
  row?: Partial<RiskLinkageAiOccurrence>,
): boolean {
  if (!row || !canAnalyzeRiskLinkageOccurrence(scope, row.riskId, row.id))
    return false;
  const candidate = {
    ...row,
    id: row.id || '',
    riskId: row.riskId || '',
    companyId: row.companyId || '',
    riskFactorGroupDataId: row.riskFactorGroupDataId || '',
  };
  return canAnalyzeRiskLinkageOccurrence(
    { context: scope.context, rows: [candidate] },
    row.riskId,
    row.id,
  );
}

export function filterRiskLinkageOccurrenceReviews(
  reviews: ExistingRiskReview[],
  scope: RiskFactorAiOccurrenceScope,
  riskId?: string,
  occurrenceId?: string,
): ExistingRiskReview[] {
  if (!canAnalyzeRiskLinkageOccurrence(scope, riskId, occurrenceId)) return [];
  return reviews.filter(
    (review) =>
      review.riskId === riskId && review.riskFactorDataId === occurrenceId,
  );
}
