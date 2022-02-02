/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from 'react';

import clone from 'clone';

import { INestedObject } from '../../interfaces';

export const useGetNestedObject = (
  hierarchyRef: React.MutableRefObject<INestedObject>,
) => {
  const findParentByChildId = useCallback(
    (id: number | string, nestsObject?: INestedObject) => {
      let nestedObject = nestsObject
        ? { ...nestsObject }
        : { ...hierarchyRef.current };
      nestedObject = clone(nestedObject);

      const loop = (
        childObject: INestedObject,
        parentObject: INestedObject | null,
        arrayParentIdPaths = [] as Array<number | string>,
      ) => {
        const array: Array<number | string> = [...arrayParentIdPaths];

        if (parentObject?.id) array.push(parentObject.id);

        if (childObject.id === id) {
          return { parent: parentObject, path: array };
        }

        if (!childObject?.children) return { parent: null, path: [] };

        let parent: {
          parent: INestedObject | null;
          path: Array<number | string>;
        } = { parent: null, path: [] };

        childObject.children.map((child) => {
          const loopParent = loop(child, childObject, array);
          if (loopParent.parent !== null) {
            parent = loopParent;
          }
        });

        return parent;
      };

      const parentData = loop(nestedObject, null);

      return parentData;
    },
    [],
  );

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
