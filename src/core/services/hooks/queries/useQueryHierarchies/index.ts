import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IHierarchy, IHierarchyMap } from 'core/interfaces/api/IHierarchy';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const setMapHierarchies = async (hierarchyData: IHierarchy[]) => {
  const hierarchyTree = {} as IHierarchyMap;

  hierarchyData.forEach((hierarchy) => {
    hierarchyTree[hierarchy.id] = { ...hierarchy, children: [] };
  });

  Object.values(hierarchyTree).forEach((hierarchy) => {
    if (hierarchy.parentId) {
      hierarchyTree[hierarchy.parentId].children.push(hierarchy.id);
    }
  });

  return hierarchyTree;
};

export const queryHierarchies = async (companyId: string) => {
  const response = await api.get<IHierarchy[]>(
    `${ApiRoutesEnum.HIERARCHY}/${companyId}`,
  );

  return setMapHierarchies(response.data);
};

export function useQueryHierarchies(): IReactQuery<IHierarchyMap> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.HIERARCHY, companyId],
    () =>
      companyId
        ? queryHierarchies(companyId)
        : <Promise<IHierarchyMap>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || ({} as IHierarchyMap) };
}
