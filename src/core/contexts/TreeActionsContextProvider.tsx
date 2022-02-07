/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, FC, useCallback, useContext } from 'react';
import { useStore } from 'react-redux';

import {
  ITreeActionsContextData,
  ITreeActionsContextProps,
  ITreeMap,
  ITreeMapEdit,
  ITreeMapObject,
  ITreeMapPartial,
} from '../../components/main/OrgTree/interfaces';
import {
  setDragItem,
  setEditMapTreeNode,
  setEditNodes,
  setExpandAll,
  setMapTree,
  setRemoveNode,
  setSelectItem,
  setAddNodes,
} from '../../store/reducers/tree/treeSlice';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { randomNumber } from '../utils/helpers/randomNumber';

const TreeActionsContext = createContext({} as ITreeActionsContextData);

export const TreeActionsContextProvider: FC<ITreeActionsContextProps> = ({
  children,
}) => {
  const dispatch = useAppDispatch();

  const store = useStore();

  const setTree = useCallback(
    (nodesMap: ITreeMap) => {
      dispatch(setMapTree(nodesMap));
    },
    [dispatch],
  );

  // can delete new nodes, only edit/create
  const editTreeMap = useCallback(
    (nodesMap: ITreeMapPartial) => {
      dispatch(setEditMapTreeNode(nodesMap));
    },
    [dispatch],
  );

  // can`t delete new nodes, only edit/create
  const editNodes = useCallback(
    (nodesMap: ITreeMapEdit[]) => {
      dispatch(setEditNodes(nodesMap));
    },
    [dispatch],
  );

  const addNodes = useCallback(
    (nodesMap: ITreeMapObject[]) => {
      dispatch(setAddNodes(nodesMap));
    },
    [dispatch],
  );

  const removeNodes = (id: Array<number | string> | number | string) => {
    if (Array.isArray(id)) {
      return dispatch(setRemoveNode(id));
    }
    return dispatch(setRemoveNode([id]));
  };

  const getPathById = useCallback(
    (id: number | string) => {
      const path: string[] = [];
      const treeData = store.getState().tree;

      const loop = (id: number | string) => {
        const node = treeData.nodes[id];
        if (node) {
          path.push(node.id);
          if (node.parentId) {
            loop(node.parentId);
          }
        }
      };

      loop(id);
      return path.reverse();
    },
    [store],
  );

  const isChild = useCallback(
    (parentId: number | string, childId: number | string) => {
      return getPathById(String(childId)).includes(String(parentId));
    },
    [getPathById],
  );

  const onExpandAll = useCallback(
    (expand: boolean, nodeId?: number | string) => {
      dispatch(setExpandAll({ nodeId, expand }));
    },
    [dispatch],
  );

  const setDraggingItem = useCallback(
    (node: ITreeMapObject) => {
      dispatch(setDragItem(node));
    },
    [dispatch],
  );

  const setSelectedItem = useCallback(
    (node: ITreeMapObject, action: 'edit' | 'add' = 'edit') => {
      dispatch(setSelectItem({ ...node, action }));
    },
    [dispatch],
  );

  const getUniqueId = useCallback((): string => {
    const nodesMap = store.getState().tree.nodes as ITreeMap;
    let id = randomNumber(5);

    const loop = (idNumber: string) => {
      if (nodesMap[idNumber]) {
        id = randomNumber(5);
        loop(id);
      }
    };

    loop(id);

    return id;
  }, [store]);

  return (
    <TreeActionsContext.Provider
      value={{
        setTree,
        isChild,
        removeNodes,
        editNodes,
        setDraggingItem,
        onExpandAll,
        editTreeMap,
        setSelectedItem,
        getPathById,
        getUniqueId,
        addNodes,
      }}
    >
      {children}
    </TreeActionsContext.Provider>
  );
};

export const useTreeActions = (): ITreeActionsContextData =>
  useContext(TreeActionsContext);