/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback } from 'react';

import clone from 'clone';

import { INestedObject } from '../../interfaces';

export const useEditNestedObject = (
  hierarchyRef: React.MutableRefObject<INestedObject>,
) => {
  const editById = useCallback(
    (
      id: number | string,
      data: Partial<INestedObject>,
      action = 'soft-edit' as 'replace' | 'soft-edit' | 'remove',
      nestedObject?: INestedObject,
    ) => {
      let nestedObjectClone = nestedObject
        ? { ...nestedObject }
        : { ...hierarchyRef.current };
      nestedObjectClone = clone(nestedObjectClone);

      if (nestedObjectClone.id === id) {
        if (!action || action === 'replace')
          return { ...nestedObjectClone, ...data };
        if (!action || action === 'soft-edit')
          return {
            ...nestedObjectClone,
            ...data,
            children: [
              ...nestedObjectClone.children,
              ...(data.children ? data.children : []),
            ],
          };
        if (!action || action === 'remove')
          return {
            ...nestedObjectClone,
            ...data,
            children: [
              ...nestedObjectClone.children.filter((child) =>
                data.children
                  ? !data.children.map((i) => i.id).includes(child.id)
                  : child,
              ),
            ],
          };
      }

      if (!nestedObjectClone.children)
        return nestedObjectClone as INestedObject;

      const newChildren: INestedObject[] = nestedObjectClone.children.map(
        (child) => {
          return editById(id, data, action, child);
        },
      );

      return {
        ...nestedObjectClone,
        children: newChildren || [],
      } as INestedObject;
    },
    [],
  );

  const addChildrenById = useCallback(
    (
      id: number | string,
      data: INestedObject[],
      nestedObject?: INestedObject,
    ) => {
      let nestedObjectClone = nestedObject
        ? { ...nestedObject }
        : { ...hierarchyRef.current };
      nestedObjectClone = clone(nestedObjectClone);

      if (nestedObjectClone.id === id) {
        return {
          ...nestedObjectClone,
          children: [...nestedObjectClone.children, ...(data ? data : [])],
        };
      }

      if (!nestedObjectClone.children)
        return nestedObjectClone as INestedObject;

      const newChildren: INestedObject[] = nestedObjectClone.children.map(
        (child) => {
          return addChildrenById(id, data, child);
        },
      );

      return {
        ...nestedObjectClone,
        children: newChildren || [],
      } as INestedObject;
    },
    [],
  );

  const removeById = useCallback(
    (
      id: number | string,
      dataToRemove: Array<number | string>,
      nestedObject?: INestedObject,
    ) => {
      let nestedObjectClone = nestedObject
        ? { ...nestedObject }
        : { ...hierarchyRef.current };
      nestedObjectClone = clone(nestedObjectClone);

      if (nestedObjectClone.id === id) {
        return {
          ...nestedObjectClone,
          ...dataToRemove,
          children: [
            ...nestedObjectClone.children.filter((child) =>
              dataToRemove
                ? !dataToRemove.map((i) => i).includes(child.id)
                : !child,
            ),
          ],
        };
      }

      if (!nestedObjectClone.children)
        return nestedObjectClone as INestedObject;

      const newChildren: INestedObject[] = nestedObjectClone.children.map(
        (child) => {
          return removeById(id, dataToRemove, child);
        },
      );

      return {
        ...nestedObjectClone,
        children: newChildren || [],
      } as INestedObject;
    },
    [],
  );

  return { editById, addChildrenById, removeById };
};
