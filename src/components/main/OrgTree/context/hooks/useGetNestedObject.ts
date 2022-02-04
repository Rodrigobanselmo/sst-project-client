/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from 'react';

import clone from 'clone';

import { INestedObject } from '../../interfaces';

export const useGetNestedObject = (
  hierarchyRef: React.MutableRefObject<INestedObject>,
) => {
  const findById = useCallback(
    (id: number | string, nestsObject?: INestedObject) => {
      let nestedObject = nestsObject
        ? { ...nestsObject }
        : { ...hierarchyRef.current };
      nestedObject = clone(nestedObject);

      const loop = (nestedObject: INestedObject, itemId: number | string) => {
        if (nestedObject.id === id) {
          return nestedObject;
        }
        if (!nestedObject?.children) return null;

        let item: INestedObject | null = null;

        nestedObject.children.map((child) => {
          const loopItem = loop(child, itemId);
          if (loopItem !== null) item = loopItem;
          return;
        });

        return item;
      };

      const Item = loop(nestedObject, id);

      return Item;
    },
    [],
  );

  const isChild = useCallback(
    (parentId: number | string, childId: number | string) => {
      const { path } = findParentByChildId(childId);
      return path.includes(parentId);
    },
    [findParentByChildId],
  );

  return { findParentByChildId, findById, isChild };
};
