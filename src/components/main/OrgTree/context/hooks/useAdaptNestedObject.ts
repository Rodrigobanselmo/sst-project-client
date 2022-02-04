/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback } from 'react';

import { INestedObject, IParsedArray, ITreeMap } from '../../interfaces';
import { useEditNestedObject } from './useEditNestedObject';

export const useAdaptNestedObject = (
  hierarchyRef: React.MutableRefObject<INestedObject>,
) => {
  const { editById } = useEditNestedObject(hierarchyRef);

  const nestedObjectToArray = useCallback((data: INestedObject) => {
    const array: IParsedArray[] = [];

    const loopChildren = (
      { children, ...dataChildren }: INestedObject,
      parentId?: number | string,
    ) => {
      const insert = {
        ...dataChildren,
        parentId: null as number | string | null,
      };

      if (parentId || typeof parentId === 'number') {
        insert.parentId = parentId;
      }

      array.push(insert);

      if (
        Array.isArray(dataChildren.children) &&
        dataChildren.children.length > 0
      )
        dataChildren.children.map((child) => {
          loopChildren(child, dataChildren.id);
        });
    };

    loopChildren(data);

    return array;
  }, []);

  const nestedObjectToMap = useCallback((data: INestedObject) => {
    const mapObject: ITreeMap = {};

    const loopChildren = (
      { children, ...dataChildren }: INestedObject,
      parentId?: number | string,
    ) => {
      const insert = {
        ...dataChildren,
        parentId: null as number | string | null,
        childrenIds: children.map((child) => child.id),
      };

      if (parentId || typeof parentId === 'number') {
        insert.parentId = parentId;
      }

      mapObject[insert.id] = insert;

      if (Array.isArray(children) && children.length > 0)
        children.map((child) => {
          loopChildren(child, dataChildren.id);
        });
    };

    loopChildren(data);

    return mapObject;
  }, []);

  const arrayToNestedObject = useCallback(
    (data: IParsedArray[]): INestedObject => {
      const first = data.filter((i) => !i.parentId);

      if (first.length !== 1)
        return {
          id: 0,
          children: [],
          label: 'error',
        } as INestedObject;

      const { parentId, ...firstItem } = first[0];

      let nestedObject = {
        ...firstItem,
        children: [],
      } as unknown as INestedObject;

      const loopArray = (
        dataArray: IParsedArray[],
        parentId: number | string,
      ) => {
        const children = [] as INestedObject[];
        dataArray.map((child) => {
          if (child.parentId === parentId) {
            const insert = {
              id: child.id,
              label: child.label,
              children: [] as INestedObject[],
            };
            children.push(insert);
          }
        });

        if (children.length === 0) return;

        const newNestedObject = editById(
          parentId,
          {
            children,
          },
          'replace',
          nestedObject,
        );

        nestedObject = newNestedObject;

        children.map((childLoop) => {
          loopArray(dataArray, childLoop.id);
        });
      };

      loopArray(data, first[0].id);

      return nestedObject;
    },
    [editById],
  );

  return { nestedObjectToArray, nestedObjectToMap, arrayToNestedObject };
};
