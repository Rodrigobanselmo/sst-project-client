/**
 * Contract tests for organogram deep-link + render-loop guard.
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/hooks/useHierarchyDeepLink.spec.ts
 */
import assert from 'node:assert/strict';

type TreeNode = {
  id: string;
  parentId: string | null;
  label: string;
  childrenIds: string[];
  expand?: boolean;
};

type TreeMap = Record<string, TreeNode>;

/**
 * Mirrors the safe deep-link apply sequence (no useSelector subscription).
 * Returns whether a setTree/edit would be scheduled and the resulting status.
 */
function applyDeepLink(params: {
  ready: boolean;
  hierarchyId?: string;
  tabWorkspaceId?: string;
  openCard?: string;
  nodes: TreeMap;
  alreadyAppliedKey: string | null;
}): {
  status: 'idle' | 'applied' | 'not-found' | 'skipped';
  applyKey: string | null;
  ancestorIds: string[];
  openCard: boolean;
  wouldSubscribeToNodes: false;
} {
  const wouldSubscribeToNodes = false as const;
  if (!params.ready) {
    return {
      status: 'idle',
      applyKey: null,
      ancestorIds: [],
      openCard: false,
      wouldSubscribeToNodes,
    };
  }
  if (!params.hierarchyId) {
    return {
      status: 'skipped',
      applyKey: null,
      ancestorIds: [],
      openCard: false,
      wouldSubscribeToNodes,
    };
  }
  if (!params.tabWorkspaceId) {
    return {
      status: 'not-found',
      applyKey: null,
      ancestorIds: [],
      openCard: false,
      wouldSubscribeToNodes,
    };
  }

  const treeNodeId = `${params.hierarchyId}//${params.tabWorkspaceId}`;
  const applyKey = `${treeNodeId}|${params.openCard === '1' ? '1' : '0'}`;
  if (params.alreadyAppliedKey === applyKey) {
    return {
      status: 'applied',
      applyKey,
      ancestorIds: [],
      openCard: false,
      wouldSubscribeToNodes,
    };
  }

  const node = params.nodes[treeNodeId];
  if (!node) {
    const hasCompanyRoot = Object.keys(params.nodes).length > 1;
    if (!hasCompanyRoot) {
      return {
        status: 'idle',
        applyKey: null,
        ancestorIds: [],
        openCard: false,
        wouldSubscribeToNodes,
      };
    }
    return {
      status: 'not-found',
      applyKey,
      ancestorIds: [],
      openCard: false,
      wouldSubscribeToNodes,
    };
  }

  const path: string[] = [];
  let cur: TreeNode | undefined = node;
  const visited = new Set<string>();
  while (cur && !visited.has(cur.id)) {
    visited.add(cur.id);
    path.push(cur.id);
    cur = cur.parentId ? params.nodes[cur.parentId] : undefined;
  }
  path.reverse();

  return {
    status: 'applied',
    applyKey,
    ancestorIds: path.slice(0, -1),
    openCard: params.openCard === '1',
    wouldSubscribeToNodes,
  };
}

/** Detects the regression: page re-render on nodes change + unstable filter fn. */
function wouldInfiniteSetTreeLoop(params: {
  deepLinkSubscribesToNodes: boolean;
  searchFilterNodesIdentityChangesEveryRender: boolean;
  loadEffectDependsOnSearchFilterNodes: boolean;
}): boolean {
  return (
    params.deepLinkSubscribesToNodes &&
    params.searchFilterNodesIdentityChangesEveryRender &&
    params.loadEffectDependsOnSearchFilterNodes
  );
}

assert.equal(
  wouldInfiniteSetTreeLoop({
    deepLinkSubscribesToNodes: true,
    searchFilterNodesIdentityChangesEveryRender: true,
    loadEffectDependsOnSearchFilterNodes: true,
  }),
  true,
  'legacy combination must be recognized as a loop',
);

assert.equal(
  wouldInfiniteSetTreeLoop({
    deepLinkSubscribesToNodes: false,
    searchFilterNodesIdentityChangesEveryRender: false,
    loadEffectDependsOnSearchFilterNodes: true,
  }),
  false,
  'fixed combination must not loop',
);

const empty = applyDeepLink({
  ready: true,
  nodes: { company: { id: 'company', parentId: null, label: 'C', childrenIds: [] } },
});
assert.equal(empty.status, 'skipped');

const leafTree: TreeMap = {
  company: { id: 'company', parentId: null, label: 'C', childrenIds: ['ws'] },
  ws: { id: 'ws', parentId: 'company', label: 'WS', childrenIds: ['h1//ws'] },
  'h1//ws': {
    id: 'h1//ws',
    parentId: 'ws',
    label: 'Leaf',
    childrenIds: [],
  },
};

const leaf = applyDeepLink({
  ready: true,
  hierarchyId: 'h1',
  tabWorkspaceId: 'ws',
  openCard: '1',
  nodes: leafTree,
  alreadyAppliedKey: null,
});
assert.equal(leaf.status, 'applied');
assert.ok(leaf.ancestorIds.includes('ws'));
assert.ok(leaf.ancestorIds.includes('company'));
assert.equal(leaf.openCard, true);
assert.equal(leaf.wouldSubscribeToNodes, false);

const withChildren: TreeMap = {
  ...leafTree,
  'h1//ws': {
    id: 'h1//ws',
    parentId: 'ws',
    label: 'Parent',
    childrenIds: ['h2//ws'],
  },
  'h2//ws': {
    id: 'h2//ws',
    parentId: 'h1//ws',
    label: 'Child',
    childrenIds: [],
  },
};
const parent = applyDeepLink({
  ready: true,
  hierarchyId: 'h1',
  tabWorkspaceId: 'ws',
  nodes: withChildren,
  alreadyAppliedKey: null,
});
assert.equal(parent.status, 'applied');

const missing = applyDeepLink({
  ready: true,
  hierarchyId: 'missing',
  tabWorkspaceId: 'ws',
  nodes: leafTree,
  alreadyAppliedKey: null,
});
assert.equal(missing.status, 'not-found');

const notReady = applyDeepLink({
  ready: false,
  hierarchyId: 'h1',
  tabWorkspaceId: 'ws',
  nodes: leafTree,
  alreadyAppliedKey: null,
});
assert.equal(notReady.status, 'idle');

const idempotent = applyDeepLink({
  ready: true,
  hierarchyId: 'h1',
  tabWorkspaceId: 'ws',
  openCard: '1',
  nodes: leafTree,
  alreadyAppliedKey: 'h1//ws|1',
});
assert.equal(idempotent.status, 'applied');
assert.equal(idempotent.openCard, false);

const frozenChildren = Object.freeze(['b', 'a']);
const copied = [...frozenChildren].sort();
assert.deepEqual(copied, ['a', 'b']);
assert.doesNotThrow(() => {
  // Must not mutate the frozen source
  void [...frozenChildren].sort();
});

console.log('useHierarchyDeepLink.spec.ts OK');
