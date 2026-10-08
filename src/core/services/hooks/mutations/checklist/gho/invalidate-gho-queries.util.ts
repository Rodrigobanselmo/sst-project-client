import { QueryKey } from 'react-query';

import { QueryEnum } from 'core/enums/query.enums';
import { queryClient } from 'core/services/queryClient';

/**
 * A listagem paginada fica sem observador no organograma. No React Query
 * 3.39 o snapshot inativo continua fresco pelo staleTime de 1h se não for
 * apagado, e a tela volta a pintar o contador antigo. cancelQueries
 * interrompe um GET em voo; removeQueries com inactive apaga só essas
 * queries; invalidateQueries refaz as que ainda estão ativas.
 */
type GhoQueryFilters = {
  predicate: (query: { queryKey?: QueryKey }) => boolean;
  inactive?: boolean;
};

type GhoSyncClient = {
  cancelQueries: (filters: GhoQueryFilters) => Promise<unknown>;
  removeQueries: (filters: GhoQueryFilters) => void;
  invalidateQueries: (
    filters: GhoQueryFilters,
    options?: { cancelRefetch?: boolean },
  ) => Promise<unknown>;
};

export function isGhoFamilyQueryKey(queryKey: QueryKey | undefined): boolean {
  return Array.isArray(queryKey) && queryKey[0] === QueryEnum.GHO;
}

export function isHierarchyFamilyQueryKey(
  queryKey: QueryKey | undefined,
  companyId?: string,
): boolean {
  if (!Array.isArray(queryKey) || queryKey[0] !== QueryEnum.HIERARCHY) {
    return false;
  }
  if (!companyId) return true;
  return queryKey[1] === companyId;
}

export async function invalidateGhoFamily(client: GhoSyncClient = queryClient) {
  const predicate = (query: { queryKey?: QueryKey }) =>
    isGhoFamilyQueryKey(query.queryKey);

  await client.cancelQueries({ predicate });
  client.removeQueries({ predicate, inactive: true });
  return client.invalidateQueries({ predicate }, { cancelRefetch: true });
}

export function invalidateHierarchyFamily(
  companyId?: string,
  client: GhoSyncClient = queryClient,
) {
  return client.invalidateQueries(
    {
      predicate: (query) =>
        isHierarchyFamilyQueryKey(query.queryKey, companyId),
    },
    { cancelRefetch: true },
  );
}

export function invalidateGhoAndHierarchyFamilies(
  companyId?: string,
  client: GhoSyncClient = queryClient,
) {
  return Promise.all([
    invalidateHierarchyFamily(companyId, client),
    invalidateGhoFamily(client),
  ]);
}
