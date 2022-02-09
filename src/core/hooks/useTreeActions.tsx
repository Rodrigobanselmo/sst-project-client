/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback } from 'react';
import { useStore } from 'react-redux';

import { nodeTypesConstant } from 'components/main/OrgTree/components/ModalEditCard/constants/node-type.constant';

import {
  ITreeMap,
  ITreeMapEdit,
  ITreeMapObject,
  ITreeMapPartial,
} from '../../components/main/OrgTree/interfaces';
import {
  setAddNodes,
  setDragItem,
  setEditMapTreeNode,
  setEditNodes,
  setExpandAll,
  setMapTree,
  setRemoveNode,
  setSelectItem,
} from '../../store/reducers/tree/treeSlice';
import { randomNumber } from '../utils/helpers/randomNumber';
import { useAppDispatch } from './useAppDispatch';

export const useTreeActions = () => {
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

  const createEmptyCard = (nodeId: string | number) => {
    const node = store.getState().tree.nodes[nodeId] as ITreeMapObject;

    if (node) {
      const newNode = {
        id: getUniqueId(),
        childrenIds: [],
        type: nodeTypesConstant[node.type].childOptions[0],
        label: '',
        parentId: node.id,
        expand: false,
      };

      editNodes([{ id: node.id, expand: true }]);
      addNodes([newNode]);
      setSelectedItem(newNode, 'add');
    }
  };

  return {
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
    createEmptyCard,
  };
};
