/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {
  createContext,
  useCallback,
  useContext,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import clone from 'clone';

import {
  IHierarchyContextData,
  INestedObject,
  IParsedArray,
  IParsedMap,
  ISidebarDrawerProps,
} from '../interfaces';
import { useAdaptNestedObject } from './hooks/useAdaptNestedObject';
import { useEditNestedObject } from './hooks/useEditNestedObject';
import { useGetNestedObject } from './hooks/useGetNestedObject';

const HierarchyContext = createContext({} as IHierarchyContextData);

export function HierarchyContextProvider({
  children,
  onExpandNodes,
  treeRef,
  data,
}: ISidebarDrawerProps): JSX.Element {
  const [hierarchy, setHierarchy] = useState<INestedObject>(data);
  const hierarchyRef = useRef<INestedObject>(data);
  const draggingItemRef = useRef<INestedObject>(null);

  const { arrayToNestedObject, nestedObjectToArray, nestedObjectToMap } =
    useAdaptNestedObject(hierarchyRef);

  const { addChildrenById, editById, removeById } =
    useEditNestedObject(hierarchyRef);

  const { findById, findParentByChildId, isChild } =
    useGetNestedObject(hierarchyRef);

  const hierarchyMapRef = useRef<IParsedMap>(nestedObjectToMap(data));

  const setHierarchyRef = useCallback(
    (hierarchy: INestedObject) => {
      hierarchyRef.current = hierarchy;
      hierarchyMapRef.current = nestedObjectToMap(hierarchy);
    },
    [nestedObjectToMap],
  );

  React.useEffect(() => {
    setHierarchyRef(hierarchy);
  }, [hierarchy, setHierarchyRef]);

  useImperativeHandle(
    treeRef,
    () => {
      return {
        onExpandNodes,
        findById,
        findParentByChildId,
        removeById,
        editById,
        addChildrenById,
        nestedObjectToArray,
        arrayToNestedObject,
        data: hierarchyRef.current,
        isChild,
      };
    },
    [
      addChildrenById,
      arrayToNestedObject,
      editById,
      findById,
      findParentByChildId,
      nestedObjectToArray,
      onExpandNodes,
      removeById,
      isChild,
    ],
  );

  return (
    <HierarchyContext.Provider
      value={{
        draggingItemRef,
        hierarchyRef,
        hierarchy,
        setHierarchy,
        nestedObjectToArray,
        arrayToNestedObject,
        editById,
        removeById,
        findParentByChildId,
        findById,
        isChild,
        setHierarchyRef,
        hierarchyMapRef,
      }}
    >
      {children}
    </HierarchyContext.Provider>
  );
}

export const useHierarchyData = (): IHierarchyContextData =>
  useContext(HierarchyContext);
