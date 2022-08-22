import { useCallback } from 'react';

import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { sortString } from 'core/utils/sorts/string.sort';

export interface IListHierarchyQuery extends IHierarchy {
  name: string;
  id: string;
  parentsName: string;
  parents: Partial<IHierarchy>[];
}

export const useListHierarchyQuery = (companyId?: string) => {
  const { data: hierarchyTree } = useQueryHierarchies(companyId);
  // const hierarchyTree = useAppSelector(selectAllHierarchyTreeNodes);
  const hierarchyListData = useCallback(() => {
    const hierarchyArray: IListHierarchyQuery[] = Object.values(hierarchyTree)
      .map((node) => {
        const parent = node?.parentId
          ? hierarchyTree[node?.parentId]
          : { parentId: null, name: '', id: node.id };

        const parent2 = parent?.parentId
          ? hierarchyTree[parent?.parentId]
          : { parentId: null, name: '', id: '' };

        const parent3 = parent2?.parentId
          ? hierarchyTree[parent2?.parentId]
          : { parentId: null, name: '', id: '' };

        const parent4 = parent3?.parentId
          ? hierarchyTree[parent3?.parentId]
          : { parentId: null, name: '', id: '' };

        const parent5 = parent4?.parentId
          ? hierarchyTree[parent4?.parentId]
          : { parentId: null, name: '', id: '' };

        const parent6 = parent5?.parentId
          ? hierarchyTree[parent5?.parentId]
          : { parentId: null, name: '', id: '' };

        const parents = [parent6, parent5, parent4, parent3, parent2, parent];

        const parentsName = parents
          .map((parent) => parent.name)
          .filter((i) => i)
          .join(' > ');

        return {
          ...node,
          id: node.id as string,
          name: node.name,
          parentsName: parentsName,
          parents,
        };
      })
      .sort((a, b) => sortString(a, b, 'name'));
    return hierarchyArray;
  }, [hierarchyTree]);

  return { hierarchyListData, hierarchyTree };
};
