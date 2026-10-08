import { CANONICAL_HIERARCHY_TYPE_LABELS } from 'core/constants/maps/hierarchy-type-labels';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { IHierarchyOnHomogeneous } from 'core/interfaces/api/IGho';

const UNGROUPED_WORKSPACE_ID = '__ungrouped__';
const UNGROUPED_WORKSPACE_NAME = 'Sem estabelecimento';

/**
 * Abrangência efetiva de cargos (OFFICE) de um GSE.
 * Mesma regra da API em gse-effective-office-membership.util.ts:
 * o cargo entra quando ele ou um ancestral tem vínculo ativo.
 * A origem exibida é a mais próxima (o próprio cargo, senão o ancestral
 * vinculado mais perto). SUB_OFFICE fica de fora.
 * Não grava descendentes.
 */

export type GseCoverageNode = {
  id: string;
  parentId?: string | null;
  type?: string | null;
  name?: string | null;
  workspaceIds?: string[] | null;
  deletedAt?: Date | string | null;
  companyId?: string | null;
};

export type GseCoverageLink = {
  hierarchyId: string;
  linkId?: number | null;
  endDate?: Date | string | null;
  deletedAt?: Date | string | null;
  startDate?: Date | string | null;
};

export type GseOfficeCoverage = {
  officeId: string;
  officeName: string;
  origin: 'direct' | 'inherited';
  sourceHierarchyId: string;
  sourceType: string;
  sourceName: string;
  sourceLinkId: number | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
};

const OFFICE_TYPE = HierarchyEnum.OFFICE;

const ORIGIN_ARTICLE: Record<string, 'pelo' | 'pela'> = {
  [HierarchyEnum.DIRECTORY]: 'pela',
  [HierarchyEnum.MANAGEMENT]: 'pela',
  [HierarchyEnum.SECTOR]: 'pelo',
  [HierarchyEnum.SUB_SECTOR]: 'pelo',
  [HierarchyEnum.OFFICE]: 'pelo',
  [HierarchyEnum.SUB_OFFICE]: 'pelo',
};

export function isActiveGseHierarchyLink(link: {
  endDate?: Date | string | null;
  deletedAt?: Date | string | null;
} | null | undefined): boolean {
  return !!link && !link.endDate && !link.deletedAt;
}

export function formatGseInheritedOriginLabel(params: {
  sourceType?: string | null;
  sourceName?: string | null;
  sourceTypeLabel?: string | null;
}): string {
  const type = params.sourceType || '';
  const article = ORIGIN_ARTICLE[type] || 'pelo';
  const typeLabel =
    (params.sourceTypeLabel || '').trim() ||
    CANONICAL_HIERARCHY_TYPE_LABELS[type as HierarchyEnum] ||
    type ||
    'vínculo';
  const name = (params.sourceName || '').trim() || typeLabel;
  return `Vinculado ${article} ${typeLabel}: ${name}`;
}

const DEFINITE_ARTICLE: Record<string, 'o' | 'a'> = {
  [HierarchyEnum.DIRECTORY]: 'a',
  [HierarchyEnum.MANAGEMENT]: 'a',
  [HierarchyEnum.SECTOR]: 'o',
  [HierarchyEnum.SUB_SECTOR]: 'o',
  [HierarchyEnum.OFFICE]: 'o',
  [HierarchyEnum.SUB_OFFICE]: 'o',
};

function hierarchyTypeLabel(
  sourceType?: string | null,
  sourceTypeLabel?: string | null,
): string {
  const type = sourceType || '';
  return (
    (sourceTypeLabel || '').trim() ||
    CANONICAL_HIERARCHY_TYPE_LABELS[type as HierarchyEnum] ||
    type ||
    'vínculo'
  );
}

export function formatGseCoveredByLabel(params: {
  sourceType?: string | null;
  sourceName?: string | null;
  sourceTypeLabel?: string | null;
}): string {
  const type = params.sourceType || '';
  const definite = DEFINITE_ARTICLE[type] || 'o';
  const typeLabel = hierarchyTypeLabel(type, params.sourceTypeLabel);
  const name = (params.sourceName || '').trim() || typeLabel;
  return `Abrangido pelo vínculo com ${definite} ${typeLabel} ${name}`;
}

export type GseInheritedOfficeOrigin = {
  sourceHierarchyId: string;
  sourceType: string;
  sourceName: string;
  count: number;
};

export function formatGseOfficeCountLines(summary: {
  effectiveOfficeCount?: number;
  directOfficeCount?: number;
  inheritedOfficeCount?: number;
  inheritedOfficeOrigins?: GseInheritedOfficeOrigin[];
  typeLabels?: Partial<Record<string, string>>;
}): string[] {
  const effective = summary.effectiveOfficeCount ?? 0;
  const direct = summary.directOfficeCount ?? 0;
  const inherited = summary.inheritedOfficeCount ?? 0;
  const lines = [
    effective === 1 ? '1 cargo abrangido' : `${effective} cargos abrangidos`,
    `${direct} por vínculo direto`,
    `${inherited} por vínculo indireto`,
  ];
  const origins = summary.inheritedOfficeOrigins || [];
  if (!origins.length || inherited === 0) return lines;

  if (origins.length === 1) {
    const origin = origins[0];
    const typeLabel = hierarchyTypeLabel(
      origin.sourceType,
      summary.typeLabels?.[origin.sourceType],
    );
    const name = (origin.sourceName || '').trim() || typeLabel;
    lines.push(`Origem indireta: ${typeLabel} ${name}`);
    return lines;
  }

  lines.push('Origem indireta:');
  origins.forEach((origin) => {
    const article = ORIGIN_ARTICLE[origin.sourceType] || 'pelo';
    const typeLabel = hierarchyTypeLabel(
      origin.sourceType,
      summary.typeLabels?.[origin.sourceType],
    );
    const name = (origin.sourceName || '').trim() || typeLabel;
    lines.push(`${origin.count} ${article} ${typeLabel} ${name}`);
  });
  return lines;
}

function bareId(id?: string | null): string {
  return String(id || '').split('//')[0];
}

function nodeIsPresent(node: GseCoverageNode | undefined): node is GseCoverageNode {
  return !!node?.id && !node.deletedAt;
}

function inWorkspace(node: GseCoverageNode, workspaceId?: string): boolean {
  if (!workspaceId) return true;
  return (node.workspaceIds || []).includes(workspaceId);
}

type IndexedLink = {
  linkId: number | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
};

function indexActiveLinks(links: GseCoverageLink[]): Map<string, IndexedLink> {
  const byHierarchy = new Map<string, IndexedLink>();

  links.filter((link) => isActiveGseHierarchyLink(link)).forEach((link) => {
    const hierarchyId = bareId(link.hierarchyId);
    if (!hierarchyId) return;

    const next: IndexedLink = {
      linkId: link.linkId ?? null,
      startDate: link.startDate,
      endDate: link.endDate,
    };
    const current = byHierarchy.get(hierarchyId);
    if (!current) {
      byHierarchy.set(hierarchyId, next);
      return;
    }
    if (
      next.linkId != null &&
      (current.linkId == null || next.linkId < current.linkId)
    ) {
      byHierarchy.set(hierarchyId, next);
    }
  });

  return byHierarchy;
}

export function resolveEffectiveOfficeCoverage(params: {
  nodes: GseCoverageNode[];
  links: GseCoverageLink[];
  workspaceId?: string;
}): GseOfficeCoverage[] {
  const nodesById = new Map<string, GseCoverageNode>();
  params.nodes.forEach((node) => {
    if (!nodeIsPresent(node)) return;
    nodesById.set(bareId(node.id), node);
  });

  const linksByHierarchy = indexActiveLinks(params.links);
  const covered: GseOfficeCoverage[] = [];

  nodesById.forEach((node) => {
    if (node.type !== OFFICE_TYPE) return;
    if (!inWorkspace(node, params.workspaceId)) return;

    const officeId = bareId(node.id);
    let currentId: string | null = officeId;
    const seen = new Set<string>();
    let sourceId: string | null = null;

    while (currentId && !seen.has(currentId)) {
      seen.add(currentId);
      if (linksByHierarchy.has(currentId)) {
        sourceId = currentId;
        break;
      }
      const parentId = nodesById.get(currentId)?.parentId;
      currentId = parentId ? bareId(parentId) : null;
      if (currentId && !nodesById.has(currentId)) break;
    }

    if (!sourceId) return;

    const source = nodesById.get(sourceId);
    const link = linksByHierarchy.get(sourceId);
    covered.push({
      officeId,
      officeName: (node.name || '').trim(),
      origin: sourceId === officeId ? 'direct' : 'inherited',
      sourceHierarchyId: sourceId,
      sourceType: source?.type || '',
      sourceName: (source?.name || '').trim(),
      sourceLinkId: link?.linkId ?? null,
      startDate: link?.startDate,
      endDate: link?.endDate,
    });
  });

  covered.sort((a, b) => {
    const byName = a.officeName.localeCompare(b.officeName, 'pt-BR', {
      sensitivity: 'base',
    });
    if (byName !== 0) return byName;
    return a.officeId.localeCompare(b.officeId);
  });

  return covered;
}

export function collectActiveLinksFromGseHierarchies(
  hierarchies: Array<
    Pick<IHierarchy, 'id' | 'hierarchyOnHomogeneous'> & {
      hierarchyOnHomogeneous?: Array<
        Pick<IHierarchyOnHomogeneous, 'id' | 'hierarchyId' | 'endDate' | 'startDate'> & {
          deletedAt?: Date | string | null;
        }
      >;
    }
  >,
): GseCoverageLink[] {
  const links: GseCoverageLink[] = [];

  hierarchies.forEach((hierarchy) => {
    const hierarchyId = bareId(hierarchy.id);
    (hierarchy.hierarchyOnHomogeneous || [])
      .filter((link) => isActiveGseHierarchyLink(link))
      .forEach((link) => {
        links.push({
          hierarchyId: bareId(link.hierarchyId || hierarchyId),
          linkId: link.id,
          startDate: link.startDate,
          endDate: link.endDate,
          deletedAt: link.deletedAt,
        });
      });
  });

  return links;
}

export type GseCargoTabRow = {
  id: string;
  linkId: number | null;
  companyId?: string;
  name: string;
  type: HierarchyEnum.OFFICE;
  cargoName: string;
  displayName: string;
  sectorName: string;
  sectorGroupId: string;
  sectorGroupName: string;
  workspaceGroupId: string;
  workspaceGroupName: string;
  searchText: string;
  origin: 'direct' | 'inherited';
  originLabel: string;
  sourceHierarchyId: string;
  sourceType: string;
  sourceName: string;
  /** Só o cargo com vínculo próprio. Herdados não removem o ancestral daqui. */
  canUnlinkSource: boolean;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  fullPath: { id?: string; name?: string; type?: string }[];
  parents: { id?: string; name?: string; type?: string }[];
};

function ancestorChain(
  officeId: string,
  nodesById: Map<string, GseCoverageNode>,
): GseCoverageNode[] {
  const chain: GseCoverageNode[] = [];
  let current = nodesById.get(officeId);
  const seen = new Set<string>();
  while (current && !seen.has(bareId(current.id))) {
    seen.add(bareId(current.id));
    chain.push(current);
    current = current.parentId ? nodesById.get(bareId(current.parentId)) : undefined;
  }
  return chain.reverse();
}

export function buildGseCargoTabRows(params: {
  nodes: GseCoverageNode[];
  hierarchies: Parameters<typeof collectActiveLinksFromGseHierarchies>[0];
  gseWorkspaceIds?: string[];
  workspaceNamesById?: Record<string, string>;
  companyId?: string;
  typeLabels?: Partial<Record<string, string>>;
}): GseCargoTabRow[] {
  const nodesById = new Map<string, GseCoverageNode>();
  params.nodes.forEach((node) => {
    if (!nodeIsPresent(node)) return;
    nodesById.set(bareId(node.id), node);
  });

  const coverage = resolveEffectiveOfficeCoverage({
    nodes: params.nodes,
    links: collectActiveLinksFromGseHierarchies(params.hierarchies),
  });

  const gseWorkspaceIds = [...new Set((params.gseWorkspaceIds || []).filter(Boolean))];
  const rows: GseCargoTabRow[] = [];

  coverage.forEach((office) => {
    const node = nodesById.get(office.officeId);
    if (!node) return;

    const chain = ancestorChain(office.officeId, nodesById);
    const sector = chain.find((item) => item.type === HierarchyEnum.SECTOR);
    const parents = chain.slice(0, -1).reverse();
    const officeWorkspaces = [...new Set((node.workspaceIds || []).filter(Boolean))];
    const workspaces = gseWorkspaceIds.length
      ? officeWorkspaces.filter((id) => gseWorkspaceIds.includes(id))
      : officeWorkspaces;

    const targets = workspaces.length
      ? workspaces
      : [UNGROUPED_WORKSPACE_ID];

    const originLabel =
      office.origin === 'inherited'
        ? formatGseCoveredByLabel({
            sourceType: office.sourceType,
            sourceName: office.sourceName,
            sourceTypeLabel: params.typeLabels?.[office.sourceType],
          })
        : '';

    targets.forEach((workspaceId) => {
      const workspaceName =
        workspaceId === UNGROUPED_WORKSPACE_ID
          ? UNGROUPED_WORKSPACE_NAME
          : params.workspaceNamesById?.[workspaceId] || workspaceId;
      const sectorGroupName = (sector?.name || '').trim() || 'Sem setor';
      const sectorGroupId = sector ? bareId(sector.id) : 'ungrouped-sector';

      rows.push({
        id: `${office.officeId}//${workspaceId}`,
        linkId: office.sourceLinkId,
        companyId: params.companyId || node.companyId || undefined,
        name: office.officeName,
        type: HierarchyEnum.OFFICE,
        cargoName: office.officeName,
        displayName: office.officeName,
        sectorName: sectorGroupName,
        sectorGroupId,
        sectorGroupName,
        workspaceGroupId: workspaceId,
        workspaceGroupName: workspaceName,
        searchText: `${workspaceName} ${sectorGroupName} ${office.officeName} ${originLabel}`,
        origin: office.origin,
        originLabel,
        sourceHierarchyId: office.sourceHierarchyId,
        sourceType: office.sourceType,
        sourceName: office.sourceName,
        canUnlinkSource: false,
        startDate: office.startDate,
        endDate: office.endDate,
        fullPath: chain.map((item) => ({
          id: bareId(item.id),
          name: item.name || '',
          type: item.type || '',
        })),
        parents: parents.map((item) => ({
          id: bareId(item.id),
          name: item.name || '',
          type: item.type || '',
        })),
      });
    });
  });

  rows.sort((a, b) => {
    const workspace = a.workspaceGroupName.localeCompare(b.workspaceGroupName, 'pt-BR', {
      sensitivity: 'base',
    });
    if (workspace !== 0) return workspace;
    const sector = a.sectorGroupName.localeCompare(b.sectorGroupName, 'pt-BR', {
      sensitivity: 'base',
    });
    if (sector !== 0) return sector;
    const cargo = a.cargoName.localeCompare(b.cargoName, 'pt-BR', {
      sensitivity: 'base',
    });
    if (cargo !== 0) return cargo;
    return a.id.localeCompare(b.id);
  });

  rows.forEach((row) => {
    row.canUnlinkSource = row.origin === 'direct' && row.linkId != null;
  });

  return rows;
}

export type GseCargoTabLayoutRow =
  | { kind: 'workspace'; id: string; workspaceGroupName: string }
  | {
      kind: 'link';
      id: string;
      linkId: number | null;
      companyId?: string;
      name: string;
      displayName: string;
      type: string;
      typeLabel: string;
      origin: 'direct' | 'inherited';
      workspaceGroupId: string;
      workspaceGroupName: string;
      canUnlink: boolean;
      startDate?: Date | string | null;
      endDate?: Date | string | null;
    }
  | {
      kind: 'covered';
      id: string;
      name: string;
      displayName: string;
      originLabel: string;
      workspaceGroupId: string;
      workspaceGroupName: string;
    };

/**
 * Cabeçalho do vínculo explícito e, abaixo, os cargos só abrangidos.
 * A exclusão fica no vínculo, nunca no cargo herdado.
 */
export function layoutGseCargoTabRows(rows: GseCargoTabRow[]): GseCargoTabLayoutRow[] {
  type Group = {
    workspaceGroupId: string;
    workspaceGroupName: string;
    sortName: string;
    sortId: string;
    link: Extract<GseCargoTabLayoutRow, { kind: 'link' }>;
    covered: Extract<GseCargoTabLayoutRow, { kind: 'covered' }>[];
  };

  const groups: Group[] = [];
  const inherited = new Map<string, Group>();

  rows.forEach((row) => {
    if (row.origin === 'direct') {
      groups.push({
        workspaceGroupId: row.workspaceGroupId,
        workspaceGroupName: row.workspaceGroupName,
        sortName: row.cargoName || row.name,
        sortId: row.id,
        link: {
          kind: 'link',
          id: row.id,
          linkId: row.linkId,
          companyId: row.companyId,
          name: row.cargoName || row.name,
          displayName: row.displayName || row.cargoName || row.name,
          type: HierarchyEnum.OFFICE,
          typeLabel: hierarchyTypeLabel(HierarchyEnum.OFFICE),
          origin: 'direct',
          workspaceGroupId: row.workspaceGroupId,
          workspaceGroupName: row.workspaceGroupName,
          canUnlink: row.linkId != null,
          startDate: row.startDate,
          endDate: row.endDate,
        },
        covered: [],
      });
      return;
    }

    const key = `${row.workspaceGroupId}//${row.sourceHierarchyId}//${row.linkId ?? ''}`;
    let group = inherited.get(key);
    if (!group) {
      group = {
        workspaceGroupId: row.workspaceGroupId,
        workspaceGroupName: row.workspaceGroupName,
        sortName: row.sourceName || row.sectorGroupName,
        sortId: row.sourceHierarchyId,
        link: {
          kind: 'link',
          id: `${row.sourceHierarchyId}//${row.workspaceGroupId}`,
          linkId: row.linkId,
          companyId: row.companyId,
          name: row.sourceName || row.sectorGroupName,
          displayName: row.sourceName || row.sectorGroupName,
          type: row.sourceType,
          typeLabel: hierarchyTypeLabel(row.sourceType),
          origin: 'inherited',
          workspaceGroupId: row.workspaceGroupId,
          workspaceGroupName: row.workspaceGroupName,
          canUnlink: row.linkId != null,
          startDate: row.startDate,
          endDate: row.endDate,
        },
        covered: [],
      };
      inherited.set(key, group);
      groups.push(group);
    }

    group.covered.push({
      kind: 'covered',
      id: row.id,
      name: row.cargoName || row.name,
      displayName: row.displayName || row.cargoName || row.name,
      originLabel: row.originLabel,
      workspaceGroupId: row.workspaceGroupId,
      workspaceGroupName: row.workspaceGroupName,
    });
  });

  groups.sort((a, b) => {
    const workspace = a.workspaceGroupName.localeCompare(b.workspaceGroupName, 'pt-BR', {
      sensitivity: 'base',
    });
    if (workspace !== 0) return workspace;
    const name = a.sortName.localeCompare(b.sortName, 'pt-BR', { sensitivity: 'base' });
    if (name !== 0) return name;
    return a.sortId.localeCompare(b.sortId);
  });

  const layout: GseCargoTabLayoutRow[] = [];
  let lastWorkspace = '';
  groups.forEach((group) => {
    if (group.workspaceGroupId !== lastWorkspace) {
      lastWorkspace = group.workspaceGroupId;
      layout.push({
        kind: 'workspace',
        id: `group:${group.workspaceGroupId}`,
        workspaceGroupName: group.workspaceGroupName,
      });
    }
    layout.push(group.link);
    layout.push(...group.covered);
  });

  return layout;
}

export type GseCargoModalOfficeRow = {
  officeId: string;
  modalId: string;
  origin: 'direct' | 'inherited';
  originLabel: string;
  removeModalId: string;
  sourceHierarchyId: string;
};

export type GseCargoModalSelectedGroup =
  | {
      kind: 'ancestor';
      sourceModalId: string;
      sourceHierarchyId: string;
      sourceName: string;
      sourceType: string;
      offices: {
        officeId: string;
        modalId: string;
        officeName: string;
        originLabel: string;
      }[];
    }
  | {
      kind: 'direct';
      sourceModalId: string;
      officeId: string;
      officeName: string;
    };

export function buildGseCargoModalView(params: {
  nodes: GseCoverageNode[];
  modalSelectIds: string[];
  workspaceId: string;
  typeLabels?: Partial<Record<string, string>>;
}): {
  explicitModalIds: string[];
  availableOfficeModalIds: string[];
  selected: GseCargoModalOfficeRow[];
  groups: GseCargoModalSelectedGroup[];
  orphanExplicitModalIds: string[];
} {
  const workspaceId = params.workspaceId;
  const explicitModalIds = [...params.modalSelectIds];
  const explicitHere = explicitModalIds.filter(
    (modalId) => modalId.split('//')[1] === workspaceId,
  );

  const coverage = resolveEffectiveOfficeCoverage({
    nodes: params.nodes,
    workspaceId,
    links: explicitHere.map((modalId) => ({
      hierarchyId: bareId(modalId),
    })),
  });

  const coveredModalIds = new Set(
    coverage.map((office) => `${office.officeId}//${workspaceId}`),
  );
  const officeIds = new Set(
    params.nodes
      .filter(
        (node) =>
          nodeIsPresent(node) &&
          node.type === OFFICE_TYPE &&
          inWorkspace(node, workspaceId),
      )
      .map((node) => bareId(node.id)),
  );

  const availableOfficeModalIds = [...officeIds]
    .filter((officeId) => !coveredModalIds.has(`${officeId}//${workspaceId}`))
    .map((officeId) => `${officeId}//${workspaceId}`)
    .sort();

  const typeLabels = params.typeLabels;
  const selected = coverage.map((office) => ({
    officeId: office.officeId,
    modalId: `${office.officeId}//${workspaceId}`,
    origin: office.origin,
    originLabel:
      office.origin === 'inherited'
        ? formatGseCoveredByLabel({
            sourceType: office.sourceType,
            sourceName: office.sourceName,
            sourceTypeLabel: typeLabels?.[office.sourceType],
          })
        : '',
    removeModalId: `${office.sourceHierarchyId}//${workspaceId}`,
    sourceHierarchyId: office.sourceHierarchyId,
  }));

  const groups: GseCargoModalSelectedGroup[] = [];
  const ancestorGroups = new Map<string, Extract<GseCargoModalSelectedGroup, { kind: 'ancestor' }>>();
  selected.forEach((office) => {
    if (office.origin === 'direct') {
      groups.push({
        kind: 'direct',
        sourceModalId: office.removeModalId,
        officeId: office.officeId,
        officeName:
          coverage.find((item) => item.officeId === office.officeId)?.officeName ||
          office.officeId,
      });
      return;
    }
    let group = ancestorGroups.get(office.sourceHierarchyId);
    if (!group) {
      const source = coverage.find((item) => item.officeId === office.officeId);
      group = {
        kind: 'ancestor',
        sourceModalId: office.removeModalId,
        sourceHierarchyId: office.sourceHierarchyId,
        sourceName: source?.sourceName || '',
        sourceType: source?.sourceType || '',
        offices: [],
      };
      ancestorGroups.set(office.sourceHierarchyId, group);
      groups.push(group);
    }
    group.offices.push({
      officeId: office.officeId,
      modalId: office.modalId,
      officeName:
        coverage.find((item) => item.officeId === office.officeId)?.officeName ||
        office.officeId,
      originLabel: office.originLabel,
    });
  });

  groups.sort((a, b) => {
    const aName = a.kind === 'direct' ? a.officeName : a.sourceName;
    const bName = b.kind === 'direct' ? b.officeName : b.sourceName;
    const byName = aName.localeCompare(bName, 'pt-BR', { sensitivity: 'base' });
    if (byName !== 0) return byName;
    const aId = a.kind === 'direct' ? a.officeId : a.sourceHierarchyId;
    const bId = b.kind === 'direct' ? b.officeId : b.sourceHierarchyId;
    return aId.localeCompare(bId);
  });

  const sourceIds = new Set(coverage.map((office) => office.sourceHierarchyId));
  const orphanExplicitModalIds = explicitHere.filter((modalId) => {
    const hierarchyId = bareId(modalId);
    if (officeIds.has(hierarchyId)) return false;
    if (sourceIds.has(hierarchyId)) return false;
    return true;
  });

  return {
    explicitModalIds,
    availableOfficeModalIds,
    selected,
    groups,
    orphanExplicitModalIds,
  };
}
