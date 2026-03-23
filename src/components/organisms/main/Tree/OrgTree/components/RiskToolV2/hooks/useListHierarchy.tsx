import { useCallback } from 'react';

import { selectAllHierarchyTreeNodes } from 'store/reducers/hierarchy/hierarchySlice';

import { useAppSelector } from 'core/hooks/useAppSelector';
import { sortString } from 'core/utils/sorts/string.sort';

import { IHierarchyTreeMapObject } from '../components/RiskToolViews/RiskToolRiskView/types';

export const useListHierarchy = () => {
  const hierarchyTree = useAppSelector(selectAllHierarchyTreeNodes);

  const hierarchyListData = useCallback(() => {
    const hierarchyArray: IHierarchyTreeMapObject[] = Object.values(
      hierarchyTree,
    )
      .map((node) => {
        const parent = node?.parentId
          ? hierarchyTree[node?.parentId]
          : { parentId: null };

        const parent2 = parent?.parentId
          ? hierarchyTree[parent?.parentId]
          : { parentId: null };

        const parent3 = parent2?.parentId
          ? hierarchyTree[parent2?.parentId]
          : { parentId: null };

        const parent4 = parent3?.parentId
          ? hierarchyTree[parent3?.parentId]
          : { parentId: null };

        const parent5 = parent4?.parentId
          ? hierarchyTree[parent4?.parentId]
          : { parentId: null };

        const parent6 = parent5?.parentId
          ? hierarchyTree[parent5?.parentId]
          : { parentId: null };

        const parentsName = [
          parent6,
          parent5,
          parent4,
          parent3,
          parent2,
          parent,
        ]
          .map((parent) =>
            parent && 'label' in parent && parent?.parentId ? parent.label : '',
          )
          .filter((i) => i)
          .join(' > ');

        return {
          ...node,
          id: node.id as string,
          name: node.label,
          parentsName: parentsName,
        };
      })
      .sort((a, b) => sortString(a, b, 'name'));

    return hierarchyArray;
  }, [hierarchyTree]);

  return { hierarchyListData };
};
