import type { ParsedUrlQuery } from 'querystring';
import type { IGho } from 'core/interfaces/api/IGho';
import type { IWorkspace } from 'core/interfaces/api/ICompany';
import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { parseOrgWorkspaceFilterIds } from 'core/utils/org-workspace-query';

export type OrgPanel = 'GSE' | 'ENVIRONMENT' | null;
export function nextOrgPanel(
  current: OrgPanel,
  requested: Exclude<OrgPanel, null>,
  busy: boolean,
): OrgPanel {
  return busy ? current : current === requested ? null : requested;
}
export function eligibleEnvironmentWorkspaces(
  workspaces: IWorkspace[] | undefined,
  companyId: string,
) {
  return (workspaces || []).filter(
    (w) =>
      w.companyId === companyId &&
      w.status === 'ACTIVE' &&
      !(w as IWorkspace & { deleted_at?: unknown }).deleted_at,
  );
}
export function environmentWorkspaceId(
  query: ParsedUrlQuery,
  workspaces: IWorkspace[],
): string | undefined {
  const explicit = parseOrgWorkspaceFilterIds(query);
  if (explicit.length)
    return explicit.length === 1 && workspaces.some((w) => w.id === explicit[0])
      ? explicit[0]
      : undefined;
  return workspaces.length === 1 ? workspaces[0].id : undefined;
}
export function environmentGroups(
  groups: IGho[],
  companyId: string,
  workspaceId?: string,
): IGho[] {
  if (!workspaceId) return [];
  return groups.filter(
    (g) =>
      g.companyId === companyId &&
      g.type === HomoTypeEnum.ENVIRONMENT &&
      g.status === 'ACTIVE' &&
      !(g as IGho & { deletedAt?: unknown }).deletedAt &&
      (g.workspaceIds?.includes(workspaceId) ||
        g.workspaces?.some((w) => w.id === workspaceId)),
  );
}
/** Closing/switching a tool must not remove the header's workspace or other page context. */
export function withoutOrgRiskPanel(query: ParsedUrlQuery): ParsedUrlQuery {
  const next = { ...query };
  delete next.riskGroupId;
  return next;
}

/** Only the clicked workspace is editable; existing links from other workspaces stay in the PATCH. */
export function canLinkEnvironmentAtWorkspace(
  group: IGho,
  companyId: string,
  query: ParsedUrlQuery,
  treeNodeId: string,
): boolean {
  const explicit = parseOrgWorkspaceFilterIds(query);
  return (
    explicit.length === 1 &&
    treeNodeId.split('//')[1] === explicit[0] &&
    environmentGroups([group], companyId, explicit[0]).length === 1
  );
}
