import { useCallback, useMemo } from 'react';

import sortArray from 'sort-array';

import { IGho } from 'core/interfaces/api/IGho';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';

export interface IListGhoQuery extends Omit<IGho, 'parents'> {
  name: string;
  id: string;
  parentsName: string;
  parents: Partial<IGho>[];
}

export const useListGhoQuery = (companyId?: string) => {
  const { data: ghoQuery } = useQueryGHOAll(companyId);

  const ghoTree = useMemo(() => {
    const ghoTreeMap = {} as Record<string, IGho>;

    ghoQuery.forEach((gho) => {
      ghoTreeMap[gho.id] = { ...gho };
    });
    return ghoTreeMap;
  }, [ghoQuery]);

  // const hierarchyTree = useAppSelector(selectAllHierarchyTreeNodes);
  const ghoListData = useCallback(() => {
    const ghoArray = sortArray(
      Object.values(ghoTree).map((node) => {
        return {
          ...node,
        };
      }),
      {
        by: 'nameValue',
        computed: {
          nameValue: (v) => {
            if (!v.type) {
              return v.description;
            }

            return v.name;
          },
        },
      },
    );
    return ghoArray;
  }, [ghoTree]);

  return { ghoListData, ghoTree };
};
