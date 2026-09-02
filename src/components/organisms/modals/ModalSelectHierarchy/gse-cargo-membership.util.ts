import { IGho } from 'core/interfaces/api/IGho';
import { isTechnicalGse } from 'components/organisms/tables/GhoAllTable/is-technical-gse.util';

export type GseMembershipIndicator = {
  id: string;
  name: string;
};

export const GSE_MEMBERSHIP_VISIBLE_CAP = 3;

function isActiveHoh(link: {
  endDate?: Date | string | null;
  deletedAt?: Date | string | null;
}): boolean {
  return !link?.endDate && !link?.deletedAt;
}

function gseLinkedToWorkspace(gho: IGho, workspaceId: string): boolean {
  if (!workspaceId) return false;
  if (gho.workspaceIds?.includes(workspaceId)) return true;
  return !!gho.workspaces?.some((workspace) => workspace.id === workspaceId);
}

function hohMatchesWorkspace(
  workspaceId: string,
  hohWorkspaceId?: string | null,
): boolean {
  if (!hohWorkspaceId) return true;
  return hohWorkspaceId === workspaceId;
}

function hierarchyIdsOfGse(gho: IGho, workspaceId: string): string[] {
  const hoh = gho.hierarchyOnHomogeneous;
  if (hoh?.length) {
    return hoh
      .filter(isActiveHoh)
      .filter((link) => hohMatchesWorkspace(workspaceId, link.workspaceId))
      .map((link) => String(link.hierarchyId || '').split('//')[0])
      .filter(Boolean);
  }

  return (gho.hierarchies || [])
    .map((hierarchy) => String(hierarchy.id || '').split('//')[0])
    .filter(Boolean);
}

/** GSEs técnicos ativos por cargo no estabelecimento atual. Somente leitura. */
export function buildGseMembershipByHierarchyId(
  ghos: IGho[],
  workspaceId: string,
): Map<string, GseMembershipIndicator[]> {
  const byHierarchy = new Map<string, Map<string, GseMembershipIndicator>>();

  ghos.filter(isTechnicalGse).forEach((gho) => {
    if (!gseLinkedToWorkspace(gho, workspaceId)) return;

    const indicator: GseMembershipIndicator = {
      id: gho.id,
      name: (gho.name || '').trim() || gho.id,
    };

    uniqueIds(hierarchyIdsOfGse(gho, workspaceId)).forEach((hierarchyId) => {
      const current = byHierarchy.get(hierarchyId) || new Map();
      current.set(indicator.id, indicator);
      byHierarchy.set(hierarchyId, current);
    });
  });

  const result = new Map<string, GseMembershipIndicator[]>();
  byHierarchy.forEach((indicators, hierarchyId) => {
    result.set(
      hierarchyId,
      [...indicators.values()].sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
      ),
    );
  });
  return result;
}

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

export function sliceGseMembershipIndicators(
  memberships: GseMembershipIndicator[],
): {
  visible: GseMembershipIndicator[];
  overflowNames: string[];
} {
  const overflow = memberships.slice(GSE_MEMBERSHIP_VISIBLE_CAP);
  return {
    visible: memberships.slice(0, GSE_MEMBERSHIP_VISIBLE_CAP),
    overflowNames: overflow.map((item) => item.name),
  };
}

export function formatGseMembershipIconTooltip(
  membership: GseMembershipIndicator,
  overflowNames: string[] = [],
): string {
  if (!overflowNames.length) return membership.name;
  return `${membership.name}\n+ ${overflowNames.length} outros: ${overflowNames.join(', ')}`;
}
