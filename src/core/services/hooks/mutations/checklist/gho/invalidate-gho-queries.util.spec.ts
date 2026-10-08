/**
 * Sincronização das queries de GSE e hierarquia depois das mutations.
 * Executar:
 * npx tsx src/core/services/hooks/mutations/checklist/gho/invalidate-gho-queries.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { QueryClient, QueryObserver, hashQueryKey } from 'react-query';

import { QueryEnum } from 'core/enums/query.enums';

import {
  explicitGhoSelectionTreeIds,
  sameGhoSelectionTreeIds,
} from 'components/organisms/main/Tree/OrgTree/utils/explicit-gho-selection-tree-ids.util';

import {
  invalidateGhoAndHierarchyFamilies,
  invalidateGhoFamily,
  isGhoFamilyQueryKey,
  isHierarchyFamilyQueryKey,
} from './invalidate-gho-queries.util';

const companyId = '34017fda-91b8-4676-a8e2-d5c823c4861e';
const gseId = 'e4cacf5a-e41e-4f8f-9c4f-36d745d1c6a9';

const paginatedListKey = [QueryEnum.GHO, 1, { companyId, page: 1, search: '' }];
const detailKey = [QueryEnum.GHO, companyId, gseId];
const allKey = [QueryEnum.GHO, companyId, undefined, undefined];

function prefixWouldMatch(
  queryKey: readonly unknown[],
  prefix: readonly unknown[],
) {
  return prefix.every((part, index) => queryKey[index] === part);
}

// A listagem paginada não é alcançada pelo prefixo [gho, companyId].
assert.equal(
  prefixWouldMatch(paginatedListKey, [QueryEnum.GHO, companyId]),
  false,
);
assert.equal(isGhoFamilyQueryKey(paginatedListKey), true);
assert.equal(isGhoFamilyQueryKey(detailKey), true);
assert.equal(isGhoFamilyQueryKey(allKey), true);
assert.equal(isGhoFamilyQueryKey([QueryEnum.HIERARCHY, companyId]), false);
assert.equal(isGhoFamilyQueryKey(undefined), false);

assert.equal(
  isHierarchyFamilyQueryKey([QueryEnum.HIERARCHY, companyId], companyId),
  true,
);
assert.equal(
  isHierarchyFamilyQueryKey(
    [QueryEnum.HIERARCHY, companyId, 'node'],
    companyId,
  ),
  true,
);
assert.equal(
  isHierarchyFamilyQueryKey([QueryEnum.HIERARCHY, 'outra'], companyId),
  false,
);
assert.equal(isHierarchyFamilyQueryKey(paginatedListKey, companyId), false);

type QueryProbe = { queryKey?: readonly unknown[] };

type RecordedCall = {
  method: 'cancelQueries' | 'removeQueries' | 'invalidateQueries';
  predicate: (query: QueryProbe) => boolean;
  inactive?: boolean;
  cancelRefetch?: boolean;
};

function recordingClient() {
  const calls: RecordedCall[] = [];
  return {
    calls,
    cancelQueries: async (filters: {
      predicate: RecordedCall['predicate'];
    }) => {
      calls.push({
        method: 'cancelQueries',
        predicate: filters.predicate,
      });
    },
    removeQueries: (filters: {
      predicate: RecordedCall['predicate'];
      inactive?: boolean;
    }) => {
      calls.push({
        method: 'removeQueries',
        predicate: filters.predicate,
        inactive: filters.inactive,
      });
    },
    invalidateQueries: async (
      filters: {
        predicate: RecordedCall['predicate'];
      },
      options?: { cancelRefetch?: boolean },
    ) => {
      calls.push({
        method: 'invalidateQueries',
        predicate: filters.predicate,
        cancelRefetch: options?.cancelRefetch,
      });
    },
  };
}

async function ghoFamilyCancelsRemovesInactiveThenRefetchesActive() {
  const client = recordingClient();
  await invalidateGhoFamily(client);

  assert.deepEqual(
    client.calls.map((call) => call.method),
    ['cancelQueries', 'removeQueries', 'invalidateQueries'],
  );
  assert.equal(client.calls[0].predicate, client.calls[1].predicate);
  assert.equal(client.calls[1].predicate, client.calls[2].predicate);
  assert.equal(client.calls[1].inactive, true);
  assert.equal(client.calls[2].cancelRefetch, true);

  const matches = client.calls[0].predicate;
  assert.equal(matches({ queryKey: paginatedListKey }), true);
  assert.equal(matches({ queryKey: detailKey }), true);
  assert.equal(matches({ queryKey: allKey }), true);
  assert.equal(matches({ queryKey: [QueryEnum.HIERARCHY, companyId] }), false);
}

async function hierarchyMutationInvalidatesBothFamilies() {
  const client = recordingClient();
  await invalidateGhoAndHierarchyFamilies(companyId, client);

  const ghoCalls = client.calls.filter((call) =>
    call.predicate({ queryKey: paginatedListKey }),
  );
  assert.deepEqual(
    ghoCalls.map((call) => call.method),
    ['cancelQueries', 'removeQueries', 'invalidateQueries'],
  );
  assert.equal(ghoCalls[0].predicate, ghoCalls[1].predicate);
  assert.equal(ghoCalls[1].predicate, ghoCalls[2].predicate);
  assert.equal(ghoCalls[1].inactive, true);
  assert.equal(ghoCalls[2].cancelRefetch, true);

  const hierarchyCalls = client.calls.filter(
    (call) =>
      call.predicate({ queryKey: [QueryEnum.HIERARCHY, companyId] }) &&
      !call.predicate({ queryKey: paginatedListKey }),
  );
  assert.equal(hierarchyCalls.length, 1);
  assert.equal(hierarchyCalls[0].method, 'invalidateQueries');
  assert.equal(hierarchyCalls[0].cancelRefetch, true);
  assert.equal(
    hierarchyCalls[0].predicate({ queryKey: [QueryEnum.HIERARCHY, 'outra'] }),
    false,
  );
}

const STALE_TIME = 1000 * 60 * 60;

type Page = {
  data: { id: string; effectiveOfficeCount: number }[];
  count: number;
};

function waitForData<T>(observer: QueryObserver<T, unknown, T>) {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('query nao concluiu')),
      2000,
    );
    const unsubscribe = observer.subscribe((result) => {
      if (result.data !== undefined) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(result.data);
      }
      if (result.status === 'error') {
        clearTimeout(timeout);
        unsubscribe();
        reject(result.error);
      }
    });
  });
}

async function inactiveListingIsRemovedAndRemountFetches() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: STALE_TIME, cacheTime: 60_000 },
    },
  });

  const companyFilters = {
    skip: 0,
    take: 15,
    search: '',
    workspaceId: '06e5f8ba-2910-4354-8c8f-5cf7e463a752',
    companyId,
  };
  const transientFilters = { ...companyFilters, companyId: undefined };
  const listKey = [QueryEnum.GHO, 1, companyFilters] as const;
  const transientKey = [QueryEnum.GHO, 1, transientFilters] as const;
  const hierarchyKey = [QueryEnum.HIERARCHY, companyId] as const;
  const stalePage: Page = {
    data: [{ id: gseId, effectiveOfficeCount: 5 }],
    count: 1,
  };
  const transientPage: Page = { data: [], count: 0 };
  const hierarchySnapshot = [{ id: 'setor-pintura' }];

  client.setQueryData(listKey, stalePage);
  client.setQueryData(transientKey, transientPage);
  client.setQueryData(detailKey, {
    id: gseId,
    hierarchies: [{ id: 'pintura' }],
  });
  client.setQueryData(allKey, [{ id: gseId }]);
  client.setQueryData(hierarchyKey, hierarchySnapshot);

  assert.notEqual(hashQueryKey(listKey), hashQueryKey(transientKey));
  assert.equal(
    client.getQueryData<Page>(listKey)?.data[0]?.effectiveOfficeCount,
    5,
  );
  assert.deepEqual(client.getQueryData(transientKey), transientPage);

  let detailFetches = 0;
  let allFetches = 0;
  const detailObserver = new QueryObserver(client, {
    queryKey: detailKey,
    staleTime: STALE_TIME,
    queryFn: async () => {
      detailFetches += 1;
      return { id: gseId, hierarchies: [] as { id: string }[] };
    },
  });
  const allObserver = new QueryObserver(client, {
    queryKey: allKey,
    staleTime: STALE_TIME,
    queryFn: async () => {
      allFetches += 1;
      return [{ id: gseId, hierarchies: [] as { id: string }[] }];
    },
  });
  const unsubscribeDetail = detailObserver.subscribe(() => undefined);
  const unsubscribeAll = allObserver.subscribe(() => undefined);

  assert.equal(client.getQueryCache().find(listKey)?.isActive(), false);
  assert.equal(client.getQueryCache().find(transientKey)?.isActive(), false);
  assert.equal(client.getQueryCache().find(detailKey)?.isActive(), true);
  assert.equal(client.getQueryCache().find(allKey)?.isActive(), true);
  assert.equal(detailFetches, 0);
  assert.equal(allFetches, 0);

  try {
    await invalidateGhoFamily(client);

    assert.equal(client.getQueryData(listKey), undefined);
    assert.equal(client.getQueryCache().find(listKey), undefined);
    assert.equal(client.getQueryData(transientKey), undefined);
    assert.equal(detailFetches, 1);
    assert.equal(allFetches, 1);
    assert.deepEqual(client.getQueryData(detailKey), {
      id: gseId,
      hierarchies: [],
    });
    assert.deepEqual(client.getQueryData(allKey), [
      { id: gseId, hierarchies: [] },
    ]);
    assert.equal(client.getQueryCache().find(detailKey)?.isActive(), true);
    assert.equal(client.getQueryCache().find(allKey)?.isActive(), true);
    assert.deepEqual(client.getQueryData(hierarchyKey), hierarchySnapshot);

    let listFetches = 0;
    const remountObserver = new QueryObserver(client, {
      queryKey: listKey,
      staleTime: STALE_TIME,
      queryFn: async () => {
        listFetches += 1;
        return {
          data: [{ id: gseId, effectiveOfficeCount: 0 }],
          count: 1,
        } satisfies Page;
      },
    });
    const remounted = await waitForData(remountObserver);

    assert.equal(listFetches, 1);
    assert.equal(remounted.data[0]?.effectiveOfficeCount, 0);
    assert.equal(
      client.getQueryData<Page>(listKey)?.data[0]?.effectiveOfficeCount,
      0,
    );
    assert.notDeepEqual(client.getQueryData(listKey), transientPage);
    assert.equal(client.getQueryData(transientKey), undefined);
    assert.deepEqual(client.getQueryData(hierarchyKey), hierarchySnapshot);
  } finally {
    unsubscribeDetail();
    unsubscribeAll();
    client.clear();
  }
}

async function main() {
  await ghoFamilyCancelsRemovesInactiveThenRefetchesActive();
  await hierarchyMutationInvalidatesBothFamilies();
  await inactiveListingIsRemovedAndRemountFetches();

  assert.deepEqual(
    explicitGhoSelectionTreeIds({
      hierarchies: [{ id: 'pintura', workspaceId: 'matriz' }],
      workspaceIds: ['matriz', 'moeve'],
    }),
    ['pintura//matriz'],
  );
  assert.deepEqual(
    explicitGhoSelectionTreeIds({
      hierarchies: [{ id: 'pintura' }],
      workspaceIds: ['matriz'],
    }),
    ['pintura//matriz'],
  );
  assert.equal(
    sameGhoSelectionTreeIds(
      ['b//matriz', 'a//matriz'],
      ['a//matriz', 'b//matriz'],
    ),
    true,
  );

  const root = process.cwd();
  const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

  const updateGho = read(
    'src/core/services/hooks/mutations/checklist/gho/useMutUpdateGho/index.ts',
  );
  assert.match(updateGho, /invalidateGhoFamily\(/);
  assert.doesNotMatch(updateGho, /setQueriesData/);
  assert.doesNotMatch(updateGho, /resp\.hierarchies \?\? gho\.hierarchies/);
  assert.doesNotMatch(
    updateGho,
    /invalidateQueries\(\[QueryEnum\.GHO, resp\.companyId\]\)/,
  );
  assert.doesNotMatch(updateGho, /effectiveOfficeCount/);

  const hierarchyMutations = [
    'src/core/services/hooks/mutations/checklist/hierarchy/useMutCreateHierarchy/index.ts',
    'src/core/services/hooks/mutations/checklist/hierarchy/useMutUpdateManyHierarchy/index.ts',
    'src/core/services/hooks/mutations/checklist/hierarchy/useMutUpsertManyHierarchy/index.ts',
    'src/core/services/hooks/mutations/checklist/hierarchy/useMutDeleteHierarchy/index.ts',
    'src/core/services/hooks/mutations/checklist/hierarchy/useMutBulkDeleteHierarchy/index.ts',
    'src/core/services/hooks/mutations/checklist/hierarchy/useMutCopyHierarchyBranch/index.ts',
  ];

  hierarchyMutations.forEach((path) => {
    const source = read(path);
    assert.match(source, /invalidateGhoAndHierarchyFamilies\(/, path);
    assert.doesNotMatch(source, /setQueryData/, path);
    assert.doesNotMatch(source, /effectiveOfficeCount/, path);
  });

  const nodeCard = read(
    'src/components/organisms/main/Tree/OrgTree/components/RenderCard/components/NodeCard/index.tsx',
  );
  assert.match(
    nodeCard,
    /dispatch\(setGhoState\(\{ hierarchies: newHierarchyIds \}\)\)/,
  );
  assert.match(nodeCard, /updateMutation\.mutate/);

  const treeLoad = read(
    'src/components/organisms/main/Tree/OrgTree/hooks/useHierarchyTreeLoad.ts',
  );
  assert.match(treeLoad, /explicitGhoSelectionTreeIds/);
  assert.doesNotMatch(treeLoad, /effectiveOfficeCount/);

  console.log('invalidate-gho-queries.util.spec: ok');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
