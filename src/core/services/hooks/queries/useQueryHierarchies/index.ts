import { useQuery } from 'react-query';

import { useRouter } from 'next/router';

import { useAuth } from 'core/contexts/AuthContext';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { IHierarchy, IHierarchyMap } from 'core/interfaces/api/IHierarchy';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryHierarchies = async () => {
  const response = await api.get<IHierarchy[]>(`${ApiRoutesEnum.HIERARCHY}`);
  const hierarchyTree = {} as IHierarchyMap;

  response.data.forEach((hierarchy) => {
    hierarchyTree[hierarchy.id] = { ...hierarchy, children: [] };
  });

  Object.values(hierarchyTree).forEach((hierarchy) => {
    if (hierarchy.parentId) {
      hierarchyTree[hierarchy.parentId].children.push(hierarchy.id);
    }
  });

  return hierarchyTree;
};

export function useQueryHierarchies(): IReactQuery<IHierarchyMap> {
  const { user } = useAuth();
  const router = useRouter();

  const company =
    user && ((router.query.companyId as string) || user?.companyId);

  const { data, ...query } = useQuery(
    [QueryEnum.HIERARCHY, company],
    () =>
      company ? queryHierarchies() : <Promise<IHierarchyMap>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || ({} as IHierarchyMap) };
}
