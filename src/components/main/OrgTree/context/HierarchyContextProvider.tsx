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

import { useAppDispatch } from '../../../../core/hooks/useAppDispatch';
import { setEditTreeNode } from '../../../../store/reducers/tree/treeSlice';
import {
  IHierarchyContextData,
  INestedObject,
  IParsedArray,
  ITreeMap,
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
  const dispatch = useAppDispatch();

  const hierarchyRef = useRef<INestedObject>(data);
  const draggingItemRef = useRef<INestedObject>(null);

  const { arrayToNestedObject, nestedObjectToArray, nestedObjectToMap } =
    useAdaptNestedObject(hierarchyRef);

  const [hierarchy, setHierarchy] = useState<ITreeMap>(nestedObjectToMap(data));

  const { addChildrenById, editById, removeById } =
    useEditNestedObject(hierarchyRef);

  const { findById, findParentByChildId, isChild } =
    useGetNestedObject(hierarchyRef);

  const hierarchyMapRef = useRef<ITreeMap>(nestedObjectToMap(data));

  const setHierarchyRef = useCallback(
    (hierarchy: INestedObject) => {
      hierarchyRef.current = hierarchy;
      hierarchyMapRef.current = nestedObjectToMap(hierarchy);
    },
    [nestedObjectToMap],
  );

  React.useEffect(() => {
    dispatch(setEditTreeNode(nestedObjectToMap(data)));
    // setHierarchyRef(hierarchy);
  }, [data, dispatch, nestedObjectToMap]);

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
