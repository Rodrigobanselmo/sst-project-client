import { IGho } from 'core/interfaces/api/IGho';

export type CharacterizationMembershipIndicator = {
  id: string;
  name: string;
};

export const CHARACTERIZATION_MEMBERSHIP_VISIBLE_CAP = 3;

function isActiveHoh(link: {
  endDate?: Date | string | null;
  deletedAt?: Date | string | null;
}): boolean {
  return !link?.endDate && !link?.deletedAt;
}

function ghoLinkedToWorkspace(gho: IGho, workspaceId: string): boolean {
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

/** Elemento Caracterizável: GHO com ref de caracterização, sem ambiente. */
export function isCharacterizableElementGho(
  gho: Pick<IGho, 'characterization' | 'environment'>,
): boolean {
  return !!gho.characterization?.id && !gho.environment;
}

function hierarchyIdsOfCharacterizableElement(
  gho: IGho,
  workspaceId: string,
): string[] {
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

/**
 * Elementos Caracterizáveis ativos por cargo no estabelecimento.
 * Fonte: cache de `useQueryGHOAll` (mesmo padrão dos indicadores de GSE).
 */
export function buildCharacterizationMembershipByHierarchyId(
  ghos: IGho[],
  workspaceId: string,
): Map<string, CharacterizationMembershipIndicator[]> {
  const byHierarchy = new Map<
    string,
    Map<string, CharacterizationMembershipIndicator>
  >();

  ghos.filter(isCharacterizableElementGho).forEach((gho) => {
    if (!ghoLinkedToWorkspace(gho, workspaceId)) return;

    const indicator: CharacterizationMembershipIndicator = {
      id: gho.characterization!.id,
      name:
        (gho.characterization!.name || gho.name || '').trim() ||
        gho.characterization!.id,
    };

    [...new Set(hierarchyIdsOfCharacterizableElement(gho, workspaceId))].forEach(
      (hierarchyId) => {
        const current = byHierarchy.get(hierarchyId) || new Map();
        current.set(indicator.id, indicator);
        byHierarchy.set(hierarchyId, current);
      },
    );
  });

  const result = new Map<string, CharacterizationMembershipIndicator[]>();
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

export function sliceCharacterizationMembershipIndicators(
  memberships: CharacterizationMembershipIndicator[],
): {
  visible: CharacterizationMembershipIndicator[];
  overflowNames: string[];
} {
  const overflow = memberships.slice(CHARACTERIZATION_MEMBERSHIP_VISIBLE_CAP);
  return {
    visible: memberships.slice(0, CHARACTERIZATION_MEMBERSHIP_VISIBLE_CAP),
    overflowNames: overflow.map((item) => item.name),
  };
}

export function formatCharacterizationMembershipIconTooltip(
  membership: CharacterizationMembershipIndicator,
  overflowNames: string[] = [],
): string {
  if (!overflowNames.length) return membership.name;
  return `${membership.name}\n+ ${overflowNames.length} outros: ${overflowNames.join(', ')}`;
}
