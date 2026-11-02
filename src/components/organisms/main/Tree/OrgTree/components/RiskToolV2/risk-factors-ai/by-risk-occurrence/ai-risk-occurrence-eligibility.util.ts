import { CharacterizationTypeEnum, getIsEnvironment } from 'project/enum/characterization-type.enum';
import {
  AiRiskOccurrenceIdentity,
  createAiRiskOccurrenceIdentity,
} from './ai-risk-occurrence.identity';
import type { RiskLinkageAiOccurrence } from '../risk-linkage-ai-context.util';

export type AiRiskOccurrenceOwner = {
  id: string;
  companyId: string;
  status: string;
  deletedAt?: unknown;
  type?: string | null;
  workspaceIds: readonly string[];
  characterization?: {
    id: string;
    companyId: string;
    workspaceId: string;
    type: string;
    deleted_at?: unknown;
  };
  hierarchy?: {
    id: string;
    companyId: string;
    type: string;
    status: string;
    workspaceIds: readonly string[];
    deletedAt?: unknown;
  };
};
export type AiRiskOccurrenceEligibilityReason =
  | 'INVALID_IDENTITY'
  | 'COMPANY_NOT_AUTHORIZED'
  | 'EDIT_NOT_AUTHORIZED'
  | 'IDENTITY_MISMATCH'
  | 'HISTORICAL_OCCURRENCE'
  | 'FUTURE_OCCURRENCE'
  | 'OWNER_UNAVAILABLE'
  | 'WORKSPACE_NOT_LINKED'
  | 'OWNER_TYPE_MISMATCH'
  | 'UNVERIFIED_ORIGIN'
  | 'INHERITED_OCCURRENCE'
  | 'AMBIGUOUS_OCCURRENCE';
type Result =
  | { eligible: true; identity: AiRiskOccurrenceIdentity }
  | { eligible: false; reason: AiRiskOccurrenceEligibilityReason };
const failure = (reason: AiRiskOccurrenceEligibilityReason): Result => ({
  eligible: false,
  reason,
});
const isCurrent = (row: RiskLinkageAiOccurrence, now: number) =>
  !row.deletedAt &&
  !row.endDate &&
  (!row.startDate ||
    (Number.isFinite(new Date(row.startDate).getTime()) &&
      new Date(row.startDate).getTime() <= now));

/** Client eligibility is a UX/identity guard; authenticated server validation remains mandatory. */
export function evaluateAiRiskOccurrence(params: {
  identity: unknown;
  row: RiskLinkageAiOccurrence;
  owner: AiRiskOccurrenceOwner;
  authorizedCompanyId: string;
  canEdit: boolean;
  siblings: readonly RiskLinkageAiOccurrence[];
  now?: number;
}): Result {
  let id: AiRiskOccurrenceIdentity;
  try {
    id = createAiRiskOccurrenceIdentity(params.identity);
  } catch {
    return failure('INVALID_IDENTITY');
  }
  const { row, owner } = params;
  const now = params.now ?? Date.now();
  if (params.authorizedCompanyId !== id.companyId)
    return failure('COMPANY_NOT_AUTHORIZED');
  if (!params.canEdit || row.canEditOnThisEntity === false)
    return failure('EDIT_NOT_AUTHORIZED');
  if (
    row.id !== id.riskFactorDataId ||
    row.companyId !== id.companyId ||
    row.riskId !== id.riskId ||
    row.riskFactorGroupDataId !== id.riskGroupId
  )
    return failure('IDENTITY_MISMATCH');
  if (
    row.homogeneousGroupId !== id.ownerId ||
    row.isDirect === false ||
    (row.originId && row.originId !== id.ownerId) ||
    (row.originKind && row.originKind !== id.ownerType) ||
    (row.hierarchyId &&
      (id.ownerType !== 'HIERARCHY' || row.hierarchyId !== id.hierarchyId))
  )
    return failure('INHERITED_OCCURRENCE');
  if (
    row.resolutionSource &&
    ![
      'GSE_OWN_RISKS',
      ...(id.ownerType === 'HIERARCHY' ? ['HIERARCHY_OWN_RISKS'] : []),
    ].includes(row.resolutionSource)
  )
    return failure('UNVERIFIED_ORIGIN');
  if (row.deletedAt || row.endDate) return failure('HISTORICAL_OCCURRENCE');
  if (!isCurrent(row, now)) return failure('FUTURE_OCCURRENCE');
  if (
    owner.id !== id.ownerId ||
    owner.companyId !== id.companyId ||
    owner.status !== 'ACTIVE' ||
    owner.deletedAt
  )
    return failure('OWNER_UNAVAILABLE');
  if (row.workspaceId && row.workspaceId !== id.workspaceId)
    return failure('WORKSPACE_NOT_LINKED');
  if (id.ownerType === 'GSE') {
    if (owner.type != null && owner.type !== '')
      return failure('OWNER_TYPE_MISMATCH');
    if (!owner.workspaceIds.includes(id.workspaceId))
      return failure('WORKSPACE_NOT_LINKED');
  } else if (id.ownerType === 'CHARACTERIZATION') {
    if (
      !['ENVIRONMENT', 'ACTIVITIES', 'EQUIPMENT', 'WORKSTATION'].includes(
        String(owner.type),
      )
    )
      return failure('OWNER_TYPE_MISMATCH');
    const element = owner.characterization;
    if (
      !element ||
      element.id !== id.ownerId ||
      element.companyId !== id.companyId ||
      element.workspaceId !== id.workspaceId ||
      element.deleted_at ||
      (owner.type === 'ENVIRONMENT'
        ? !getIsEnvironment(element.type as CharacterizationTypeEnum)
        : element.type !== owner.type)
    )
      return failure('WORKSPACE_NOT_LINKED');
  } else {
    if (owner.type !== 'HIERARCHY') return failure('OWNER_TYPE_MISMATCH');
    const node = owner.hierarchy;
    if (
      !node ||
      node.id !== id.hierarchyId ||
      node.type !== id.hierarchyType ||
      node.companyId !== id.companyId ||
      node.status !== 'ACTIVE' ||
      node.deletedAt
    )
      return failure('OWNER_UNAVAILABLE');
    if (
      !node.workspaceIds.includes(id.workspaceId) ||
      !owner.workspaceIds.includes(id.workspaceId)
    )
      return failure('WORKSPACE_NOT_LINKED');
  }
  const ids = new Set(
    params.siblings
      .filter(
        (item) =>
          item.companyId === id.companyId &&
          item.homogeneousGroupId === id.ownerId &&
          item.riskId === id.riskId &&
          item.riskFactorGroupDataId === id.riskGroupId &&
          isCurrent(item, now),
      )
      .map((item) => item.id),
  );
  if (ids.size !== 1 || !ids.has(id.riskFactorDataId))
    return failure('AMBIGUOUS_OCCURRENCE');
  return { eligible: true, identity: id };
}
