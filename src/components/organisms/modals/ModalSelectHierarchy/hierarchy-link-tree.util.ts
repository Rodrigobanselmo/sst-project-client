import { CANONICAL_HIERARCHY_TYPE_LABELS } from 'core/constants/maps/hierarchy-type-labels';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import {
  formatGseCoveredByLabel,
  resolveEffectiveOfficeCoverage,
} from 'core/utils/gse-effective-office-membership.util';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

import { uniqueModalIds } from './gse-workspace-modal-selection.util';
import {
  indexStructureNodes,
  isOrganizationalStructure,
  pruneRedundantHierarchyModalIds,
  STRUCTURE_COVERAGE_TOOLTIP,
  structureAppliesToWorkspace,
  structureBlockedByAncestor,
  StructureNode,
} from './structure-hierarchy-selection.util';

const ORGANOGRAM_CHROME_TYPES = new Set([
  'COMPANY',
  'WORKSPACE',
  'ESTABLISHMENT_GROUP',
]);

export type HierarchyLinkVisualState =
  | 'available'
  | 'explicit'
  | 'inherited'
  | 'contained'
  | 'partial';

export type HierarchyLinkTreeNode = StructureNode & {
  name?: string | null;
  deletedAt?: Date | string | null;
};

export type HierarchyLinkTreeRow = {
  id: string;
  parentId: string | null;
  modalId: string;
  name: string;
  type: string;
  typeLabel: string;
  depth: number;
  childIds: string[];
  hasChildren: boolean;
  visualState: HierarchyLinkVisualState;
  selectable: boolean;
  tooltip: string;
};

export type HierarchyLinkTreeModel = {
  rows: HierarchyLinkTreeRow[];
  explicitCount: number;
  coveredOfficeCount: number;
  summary: string;
};

function bareId(id?: string | null): string {
  return String(id || '').split('//')[0];
}

function nodeIsPresent(node: HierarchyLinkTreeNode | undefined): node is HierarchyLinkTreeNode {
  return !!node?.id && !node.deletedAt && !ORGANOGRAM_CHROME_TYPES.has(node.type || '');
}

function typeLabelOf(
  type: string,
  typeLabels?: Partial<Record<string, string>>,
): string {
  return (
    (typeLabels?.[type] || '').trim() ||
    CANONICAL_HIERARCHY_TYPE_LABELS[type as HierarchyEnum] ||
    type
  );
}

export function formatHierarchyLinkSelectionSummary(
  explicitCount: number,
  coveredOfficeCount: number,
): string {
  const explicit =
    explicitCount === 1
      ? '1 vínculo explícito'
      : `${explicitCount} vínculos explícitos`;
  const covered =
    coveredOfficeCount === 1
      ? '1 cargo abrangido'
      : `${coveredOfficeCount} cargos abrangidos`;
  return `${explicit} · ${covered}`;
}

function compareName(a: string, b: string): number {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

export function buildHierarchyLinkTreeModel(params: {
  nodes: HierarchyLinkTreeNode[];
  modalSelectIds: string[];
  workspaceId: string;
  typeLabels?: Partial<Record<string, string>>;
}): HierarchyLinkTreeModel {
  const workspaceId = params.workspaceId;
  if (!workspaceId) {
    return {
      rows: [],
      explicitCount: 0,
      coveredOfficeCount: 0,
      summary: formatHierarchyLinkSelectionSummary(0, 0),
    };
  }

  const byId = new Map<string, HierarchyLinkTreeNode>();
  params.nodes.forEach((node) => {
    if (!nodeIsPresent(node)) return;
    byId.set(bareId(node.id), node);
  });
  const presentNodes = [...byId.values()];
  const indexed = indexStructureNodes(presentNodes);
  const included = new Set<string>();

  presentNodes.forEach((node) => {
    const id = bareId(node.id);
    const workspaces = node.workspaceIds || [];
    if (node.type === HierarchyEnum.OFFICE && workspaces.includes(workspaceId)) {
      included.add(id);
      return;
    }
    if (node.type === HierarchyEnum.SUB_OFFICE && workspaces.includes(workspaceId)) {
      included.add(id);
      return;
    }
    if (
      isOrganizationalStructure(node.type) &&
      structureAppliesToWorkspace(id, indexed.byId, indexed.childrenById, workspaceId)
    ) {
      included.add(id);
    }
  });

  presentNodes.forEach((node) => {
    if (node.type !== HierarchyEnum.SUB_OFFICE) return;
    const id = bareId(node.id);
    if (included.has(id)) return;
    const workspaces = node.workspaceIds || [];
    if (workspaces.length > 0) return;
    const parentId = bareId(node.parentId);
    if (parentId && included.has(parentId)) included.add(id);
  });

  [...included].forEach((id) => {
    let parentId = bareId(byId.get(id)?.parentId);
    const seen = new Set<string>();
    while (parentId && !seen.has(parentId)) {
      seen.add(parentId);
      const parent = byId.get(parentId);
      if (!parent) break;
      if (
        parent.type === HierarchyEnum.OFFICE ||
        parent.type === HierarchyEnum.SUB_OFFICE
      ) {
        if (!(parent.workspaceIds || []).includes(workspaceId)) break;
      }
      included.add(parentId);
      parentId = bareId(parent.parentId);
    }
  });

  const explicitModalIds = uniqueModalIds(
    params.modalSelectIds.filter((modalId) => modalId.split('//')[1] === workspaceId),
  );
  const explicitBare = new Set(explicitModalIds.map((modalId) => bareId(modalId)));
  const coverage = resolveEffectiveOfficeCoverage({
    nodes: presentNodes,
    workspaceId,
    links: [...explicitBare].map((hierarchyId) => ({ hierarchyId })),
  });
  const inheritedOffices = new Set(
    coverage.filter((office) => office.origin === 'inherited').map((office) => office.officeId),
  );
  const coverageByOffice = new Map(coverage.map((office) => [office.officeId, office]));

  const childrenByIncluded = new Map<string, string[]>();
  const parentInTree = new Map<string, string | null>();

  included.forEach((id) => {
    let parentId = bareId(byId.get(id)?.parentId);
    const seen = new Set<string>();
    while (parentId && !included.has(parentId) && !seen.has(parentId)) {
      seen.add(parentId);
      parentId = bareId(byId.get(parentId)?.parentId);
    }
    const treeParent = parentId && included.has(parentId) ? parentId : null;
    parentInTree.set(id, treeParent);
    if (!treeParent) return;
    const children = childrenByIncluded.get(treeParent) || [];
    children.push(id);
    childrenByIncluded.set(treeParent, children);
  });

  childrenByIncluded.forEach((children) => {
    children.sort((a, b) =>
      compareName(byId.get(a)?.name || '', byId.get(b)?.name || ''),
    );
  });

  const hasExplicitStructuralDescendant = (id: string): boolean => {
    const stack = [...(childrenByIncluded.get(id) || [])];
    const seen = new Set<string>();
    while (stack.length) {
      const current = stack.pop() as string;
      if (seen.has(current)) continue;
      seen.add(current);
      const type = byId.get(current)?.type;
      if (type === HierarchyEnum.SUB_OFFICE) {
        stack.push(...(childrenByIncluded.get(current) || []));
        continue;
      }
      if (explicitBare.has(current)) return true;
      stack.push(...(childrenByIncluded.get(current) || []));
    }
    return false;
  };

  const nearestExplicitAncestor = (id: string) => {
    let parentId = bareId(byId.get(id)?.parentId);
    const seen = new Set<string>();
    while (parentId && !seen.has(parentId)) {
      seen.add(parentId);
      if (explicitBare.has(parentId)) {
        const ancestor = byId.get(parentId);
        return {
          type: ancestor?.type || '',
          name: ancestor?.name || '',
        };
      }
      parentId = bareId(byId.get(parentId)?.parentId);
    }
    return null;
  };

  const visualStateOf = (id: string): HierarchyLinkVisualState => {
    const type = byId.get(id)?.type;
    if (type === HierarchyEnum.SUB_OFFICE) {
      return explicitBare.has(id) ? 'explicit' : 'available';
    }
    if (type === HierarchyEnum.OFFICE) {
      if (explicitBare.has(id)) return 'explicit';
      if (inheritedOffices.has(id) || structureBlockedByAncestor(id, explicitBare, indexed.byId)) {
        return 'inherited';
      }
      return 'available';
    }
    if (explicitBare.has(id)) return 'explicit';
    if (structureBlockedByAncestor(id, explicitBare, indexed.byId)) return 'contained';
    if (hasExplicitStructuralDescendant(id)) return 'partial';
    return 'available';
  };

  const tooltipOf = (id: string, visualState: HierarchyLinkVisualState): string => {
    const node = byId.get(id);
    const type = node?.type || '';
    if (type === HierarchyEnum.SUB_OFFICE) {
      return visualState === 'explicit'
        ? 'Cargo desenvolvido com vínculo explícito. Não entra na abrangência de cargos.'
        : 'Cargo desenvolvido. A seleção é explícita e não segue a abrangência dos cargos.';
    }
    if (visualState === 'inherited') {
      const office = coverageByOffice.get(id);
      const covered = formatGseCoveredByLabel({
        sourceType: office?.sourceType,
        sourceName: office?.sourceName,
        sourceTypeLabel: params.typeLabels?.[office?.sourceType || ''],
      });
      return `${covered}. Este cargo não é gravado separadamente.`;
    }
    if (visualState === 'contained') {
      const ancestor = nearestExplicitAncestor(id);
      const label = ancestor
        ? `${typeLabelOf(ancestor.type, params.typeLabels)} ${ancestor.name}`.trim()
        : 'um ancestral';
      return `Incluído no vínculo explícito com ${label}. Este item não é gravado separadamente.`;
    }
    if (visualState === 'partial') {
      return 'Há descendentes com vínculo próprio. Marcar este nível grava só ele e remove os vínculos redundantes dos descendentes.';
    }
    if (visualState === 'explicit') {
      return 'Vínculo explícito. Desmarcar remove este vínculo e a abrangência que ele gera, sem criar vínculos nos descendentes.';
    }
    if (type === HierarchyEnum.OFFICE) return 'Grava somente este cargo.';
    return STRUCTURE_COVERAGE_TOOLTIP;
  };

  const rows: HierarchyLinkTreeRow[] = [];
  const walk = (id: string, depth: number) => {
    const node = byId.get(id);
    if (!node) return;
    const childIds = childrenByIncluded.get(id) || [];
    const visualState = visualStateOf(id);
    const type = node.type || '';
    rows.push({
      id,
      parentId: parentInTree.get(id) || null,
      modalId: `${id}//${workspaceId}`,
      name: (node.name || '').trim() || id,
      type,
      typeLabel: typeLabelOf(type, params.typeLabels),
      depth,
      childIds,
      hasChildren: childIds.length > 0,
      visualState,
      selectable:
        visualState === 'available' ||
        visualState === 'explicit' ||
        visualState === 'partial',
      tooltip: tooltipOf(id, visualState),
    });
    childIds.forEach((childId) => walk(childId, depth + 1));
  };

  const roots = [...included]
    .filter((id) => !parentInTree.get(id))
    .sort((a, b) => compareName(byId.get(a)?.name || '', byId.get(b)?.name || ''));
  roots.forEach((id) => walk(id, 0));

  return {
    rows,
    explicitCount: explicitModalIds.length,
    coveredOfficeCount: coverage.length,
    summary: formatHierarchyLinkSelectionSummary(
      explicitModalIds.length,
      coverage.length,
    ),
  };
}

export function toggleHierarchyLinkSelection(params: {
  nodes: HierarchyLinkTreeNode[];
  modalSelectIds: string[];
  workspaceId: string;
  nodeId: string;
  typeLabels?: Partial<Record<string, string>>;
}): string[] {
  const model = buildHierarchyLinkTreeModel(params);
  const row = model.rows.find((item) => item.id === bareId(params.nodeId));
  if (!row || !row.selectable) return params.modalSelectIds;

  if (row.visualState === 'explicit') {
    const next = params.modalSelectIds.filter((modalId) => modalId !== row.modalId);
    return next.length === params.modalSelectIds.length ? params.modalSelectIds : next;
  }

  if (row.visualState !== 'available' && row.visualState !== 'partial') {
    return params.modalSelectIds;
  }

  return pruneRedundantHierarchyModalIds(
    uniqueModalIds([...params.modalSelectIds, row.modalId]),
    params.nodes,
  );
}

export function expandHierarchyLinkSearchPaths(
  rows: HierarchyLinkTreeRow[],
  collapsedIds: readonly string[],
  search: string,
): string[] {
  const needle = stringNormalize(search);
  if (!needle) return [...collapsedIds];

  const byId = new Map(rows.map((row) => [row.id, row]));
  const open = new Set<string>();
  rows
    .filter((row) => stringNormalize(row.name).includes(needle))
    .forEach((match) => {
      let current: HierarchyLinkTreeRow | undefined = match;
      while (current) {
        if (current.hasChildren) open.add(current.id);
        current = current.parentId ? byId.get(current.parentId) : undefined;
      }
    });

  return collapsedIds.filter((id) => !open.has(id));
}

export function resolveHierarchyLinkTreeVisibility(params: {
  rows: HierarchyLinkTreeRow[];
  collapsedIds: readonly string[];
  search: string;
}): {
  visibleRows: HierarchyLinkTreeRow[];
  expandedIds: string[];
} {
  const byId = new Map(params.rows.map((row) => [row.id, row]));
  const collapsed = new Set(params.collapsedIds);
  const needle = stringNormalize(params.search);
  let searchClosure: Set<string> | null = null;

  if (needle) {
    searchClosure = new Set<string>();
    params.rows
      .filter((row) => stringNormalize(row.name).includes(needle))
      .forEach((match) => {
        let current: HierarchyLinkTreeRow | undefined = match;
        while (current) {
          searchClosure?.add(current.id);
          current = current.parentId ? byId.get(current.parentId) : undefined;
        }
        const stack = [...match.childIds];
        const seen = new Set<string>();
        while (stack.length) {
          const id = stack.pop() as string;
          if (seen.has(id)) continue;
          seen.add(id);
          searchClosure?.add(id);
          const child = byId.get(id);
          if (child) stack.push(...child.childIds);
        }
      });
  }

  const visibleRows: HierarchyLinkTreeRow[] = [];
  const expandedIds: string[] = [];
  const walk = (id: string, ancestorCollapsed: boolean) => {
    const row = byId.get(id);
    if (!row) return;
    if (searchClosure && !searchClosure.has(id)) return;
    if (ancestorCollapsed) return;
    visibleRows.push(row);
    if (!row.hasChildren) return;
    const open = !collapsed.has(id);
    if (open) expandedIds.push(id);
    row.childIds.forEach((childId) => walk(childId, !open));
  };

  params.rows
    .filter((row) => !row.parentId)
    .forEach((row) => walk(row.id, false));

  return { visibleRows, expandedIds };
}
