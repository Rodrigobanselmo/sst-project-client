import { isTechnicalGse } from 'components/organisms/tables/GhoAllTable/is-technical-gse.util';

import { IGho } from 'core/interfaces/api/IGho';

import { isCharacterizableElementGho } from './characterization-cargo-membership.util';

export type HierarchyLinkMembershipKind = 'gse' | 'characterization';

export type HierarchyLinkMembershipIndicator = {
  id: string;
  name: string;
  kind: HierarchyLinkMembershipKind;
};

export const HIERARCHY_LINK_MEMBERSHIP_VISIBLE_CAP = 3;

const KIND_LABEL: Record<HierarchyLinkMembershipKind, string> = {
  gse: 'Vinculado ao GSE',
  characterization: 'Vinculado ao Elemento Caracterizado',
};

function isActiveLink(link: {
  endDate?: Date | string | null;
  deletedAt?: Date | string | null;
}): boolean {
  return !link?.endDate && !link?.deletedAt;
}

function groupLinkedToWorkspace(gho: IGho, workspaceId: string): boolean {
  if (!workspaceId) return false;
  if (gho.workspaceIds?.includes(workspaceId)) return true;
  return !!gho.workspaces?.some((workspace) => workspace.id === workspaceId);
}

/**
 * A regra já usada pelos indicadores: vínculo sem workspaceId entra no
 * estabelecimento aberto. Um grupo presente em dois estabelecimentos pode,
 * nesse caso, repetir o mesmo vínculo nos dois.
 */
export function hierarchyLinkMatchesWorkspace(
  workspaceId: string,
  linkWorkspaceId?: string | null,
): boolean {
  if (!linkWorkspaceId) return true;
  return linkWorkspaceId === workspaceId;
}

function explicitHierarchyIds(gho: IGho, workspaceId: string): string[] {
  const links = gho.hierarchyOnHomogeneous;
  if (links?.length) {
    return links
      .filter(isActiveLink)
      .filter((link) => hierarchyLinkMatchesWorkspace(workspaceId, link.workspaceId))
      .map((link) => String(link.hierarchyId || '').split('//')[0])
      .filter(Boolean);
  }

  return (gho.hierarchies || [])
    .map((hierarchy) => String(hierarchy.id || '').split('//')[0])
    .filter(Boolean);
}

export function classifyHierarchyLinkMembership(
  gho: IGho,
): HierarchyLinkMembershipKind | null {
  if (isTechnicalGse(gho)) return 'gse';
  if (isCharacterizableElementGho(gho)) return 'characterization';
  return null;
}

function indicatorOf(
  gho: IGho,
  kind: HierarchyLinkMembershipKind,
): HierarchyLinkMembershipIndicator {
  if (kind === 'characterization') {
    const characterization = gho.characterization!;
    return {
      id: characterization.id,
      name:
        (characterization.name || gho.name || '').trim() || characterization.id,
      kind,
    };
  }

  return {
    id: gho.id,
    name: (gho.name || '').trim() || gho.id,
    kind,
  };
}

function isEditingThisRecord(
  gho: IGho,
  kind: HierarchyLinkMembershipKind,
  excludeGseId?: string,
  excludeCharacterizationId?: string,
): boolean {
  if (kind === 'gse') return !!excludeGseId && gho.id === excludeGseId;
  return (
    !!excludeCharacterizationId &&
    gho.characterization?.id === excludeCharacterizationId
  );
}

/**
 * Vínculos explícitos e ativos de outros GSEs e Elementos Caracterizados,
 * por nó hierárquico. Não propaga o indicador aos cargos abrangidos por herança.
 */
export function buildHierarchyLinkMembershipByHierarchyId(
  ghos: IGho[],
  params: {
    workspaceId: string;
    excludeGseId?: string;
    excludeCharacterizationId?: string;
  },
): Map<string, HierarchyLinkMembershipIndicator[]> {
  const byHierarchy = new Map<
    string,
    Map<string, HierarchyLinkMembershipIndicator>
  >();

  ghos.forEach((gho) => {
    const kind = classifyHierarchyLinkMembership(gho);
    if (!kind) return;
    if (!groupLinkedToWorkspace(gho, params.workspaceId)) return;
    if (
      isEditingThisRecord(
        gho,
        kind,
        params.excludeGseId,
        params.excludeCharacterizationId,
      )
    ) {
      return;
    }

    const indicator = indicatorOf(gho, kind);
    const indicatorKey = `${kind}:${indicator.id}`;
    [...new Set(explicitHierarchyIds(gho, params.workspaceId))].forEach(
      (hierarchyId) => {
        const current = byHierarchy.get(hierarchyId) || new Map();
        current.set(indicatorKey, indicator);
        byHierarchy.set(hierarchyId, current);
      },
    );
  });

  const result = new Map<string, HierarchyLinkMembershipIndicator[]>();
  byHierarchy.forEach((indicators, hierarchyId) => {
    result.set(
      hierarchyId,
      [...indicators.values()].sort((left, right) => {
        const byName = left.name.localeCompare(right.name, 'pt-BR', {
          sensitivity: 'base',
        });
        if (byName !== 0) return byName;
        return left.kind.localeCompare(right.kind);
      }),
    );
  });
  return result;
}

export function sliceHierarchyLinkMembershipIndicators(
  memberships: HierarchyLinkMembershipIndicator[],
): {
  visible: HierarchyLinkMembershipIndicator[];
  overflow: HierarchyLinkMembershipIndicator[];
} {
  return {
    visible: memberships.slice(0, HIERARCHY_LINK_MEMBERSHIP_VISIBLE_CAP),
    overflow: memberships.slice(HIERARCHY_LINK_MEMBERSHIP_VISIBLE_CAP),
  };
}

export function formatHierarchyLinkMembershipLabel(
  membership: Pick<HierarchyLinkMembershipIndicator, 'kind' | 'name'>,
): string {
  return `${KIND_LABEL[membership.kind]}: ${membership.name}`;
}

export function formatHierarchyLinkMembershipTooltip(
  membership: HierarchyLinkMembershipIndicator,
  overflow: HierarchyLinkMembershipIndicator[] = [],
): string {
  const head = formatHierarchyLinkMembershipLabel(membership);
  if (!overflow.length) return head;
  const rest = overflow.map(formatHierarchyLinkMembershipLabel).join('\n');
  return `${head}\n+ ${overflow.length} outros:\n${rest}`;
}
