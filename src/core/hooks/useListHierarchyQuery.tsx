import { useCallback } from 'react';

import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { sortString } from 'core/utils/sorts/string.sort';

export interface IListHierarchyQuery extends IHierarchy {
  name: string;
  id: string;
  parentsName: string;
}

export const useListHierarchyQuery = () => {
  const { data: hierarchyTree } = useQueryHierarchies();
  // const hierarchyTree = useAppSelector(selectAllHierarchyTreeNodes);
  const hierarchyListData = useCallback(() => {
    const hierarchyArray: IListHierarchyQuery[] = Object.values(hierarchyTree)
      .map((node) => {
        const parent = node?.parentId
          ? hierarchyTree[node?.parentId]
          : { parentId: null, name: '' };

        const parent2 = parent?.parentId
          ? hierarchyTree[parent?.parentId]
          : { parentId: null, name: '' };

        const parent3 = parent2?.parentId
          ? hierarchyTree[parent2?.parentId]
          : { parentId: null, name: '' };

        const parent4 = parent3?.parentId
          ? hierarchyTree[parent3?.parentId]
          : { parentId: null, name: '' };

        const parent5 = parent4?.parentId
          ? hierarchyTree[parent4?.parentId]
          : { parentId: null, name: '' };

        const parent6 = parent5?.parentId
          ? hierarchyTree[parent5?.parentId]
          : { parentId: null, name: '' };

        const parentsName = [
          parent6,
          parent5,
          parent4,
          parent3,
          parent2,
          parent,
        ]
          .map((parent) => parent.name)
          .filter((i) => i)
          .join(' > ');

        return {
          ...node,
          id: node.id as string,
          name: node.name,
          parentsName: parentsName,
        };
      })
      .sort((a, b) => sortString(a, b, 'name'));
    return hierarchyArray;
  }, [hierarchyTree]);

  return { hierarchyListData };
};
