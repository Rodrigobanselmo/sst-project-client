/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback } from 'react';
import { useStore } from 'react-redux';

import { nodeTypesConstant } from 'components/main/OrgTree/constants/node-type.constant';

import { firstNodeId } from 'core/constants/first-node-id.constant';

import {
  ITreeCopyItem,
  ITreeMap,
  ITreeMapEdit,
  ITreeMapObject,
  ITreeMapPartial,
} from '../../components/main/OrgTree/interfaces';
import {
  setAddNodes,
  setDragItem,
  setEditBlockingNodes,
  setEditMapTreeNode,
  setEditNodes,
  setExpandAll,
  setMapTree,
  setRemoveNode,
  setSelectCopy,
  setSelectItem,
} from '../../store/reducers/tree/treeSlice';
import { randomNumber } from '../utils/helpers/randomNumber';
import { useAppDispatch } from './useAppDispatch';

export const useTreeActions = () => {
  const dispatch = useAppDispatch();

  const store = useStore();

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

  const setTree = useCallback(
    (nodesMap: ITreeMap) => {
      dispatch(setMapTree(nodesMap));
    },
    [dispatch],
  );

  const editTreeMap = useCallback(
    (nodesMap: ITreeMapPartial) => {
      dispatch(setEditMapTreeNode(nodesMap));
    },
    [dispatch],
  );

  const editNodes = useCallback(
    (nodesMap: ITreeMapEdit[]) => {
      dispatch(setEditNodes(nodesMap));
    },
    [dispatch],
  );

  const setBlockNode = useCallback(
    (node: ITreeMapEdit) => {
      dispatch(setEditBlockingNodes(node));
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
      const path: (string | number)[] = [];
      const nodes = store.getState().tree.nodes as ITreeMap;

      const loop = (id: number | string) => {
        const node = nodes[id];
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

  const getHigherLevelNodes = useCallback(
    (id: number | string) => {
      const nodes = store.getState().tree.nodes as ITreeMap;
      const higherNodesId: (string | number)[] = [];

      let hasFoundNode = false;

      const loop = (_id: number | string) => {
        if (!hasFoundNode && id === _id) hasFoundNode = true;
        if (hasFoundNode) return;

        const node = nodes[_id];
        if (node) {
          higherNodesId.push(node.id);
          node.childrenIds.forEach((childId) => loop(childId));
        }
      };

      loop(firstNodeId);
      return higherNodesId;
    },
    [store],
  );

  const cloneBranch = useCallback(
    (
      id: number | string,
      parentId: number | string,
      withChildren?: boolean,
      shouldCloneMemory?: boolean,
    ) => {
      const treeData = store.getState().tree.nodes;
      const cloneTree: ITreeMap = { [parentId]: { ...treeData[parentId] } };

      const loop = (
        id: number | string,
        _parentId: number | string,
        isFirst?: boolean,
      ) => {
        const node = treeData[id] as ITreeMapObject | null;
        const cloneNodeParent = cloneTree[_parentId] as ITreeMapObject | null;

        if (node) {
          let memo = {} as ITreeCopyItem;

          const copyItem = store.getState().tree
            .copyItem as ITreeCopyItem | null;

          if (shouldCloneMemory && copyItem) {
            memo = copyItem;
          }
          const cloneNode = {
            ...node,
            id: getUniqueId(),
            parentId: _parentId,
            childrenIds: [],
          } as ITreeMapObject;
          cloneTree[cloneNode.id] = cloneNode;

          if (withChildren || isFirst) {
            if (cloneNodeParent)
              cloneTree[_parentId].childrenIds = [
                ...cloneTree[_parentId].childrenIds,
                cloneNode.id,
              ];
            if (node.childrenIds && withChildren) {
              node.childrenIds.map((childId) => loop(childId, cloneNode.id));
            }
          }
        }
      };

      loop(id, parentId, true);
      return cloneTree;
    },
    [getUniqueId, store],
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

  const setCopyItem = useCallback(
    (node: ITreeMapObject, isCopyAll: boolean) => {
      dispatch(setSelectCopy({ ...node, all: isCopyAll }));
    },
    [dispatch],
  );

  const setPasteItem = useCallback(
    (node: ITreeMapObject) => {
      const copyItem = store.getState().tree.copyItem as ITreeCopyItem | null;

      if (copyItem) {
        const clone = cloneBranch(copyItem.id, node.id, copyItem.all);
        editTreeMap(clone);
      }
    },
    [cloneBranch, editTreeMap, store],
  );

  const createEmptyCard = (
    nodeId: string | number,
    exampleNode: Partial<ITreeMapObject> = {},
  ) => {
    const node = store.getState().tree.nodes[nodeId] as ITreeMapObject;

    if (node) {
      const newNode = {
        id: getUniqueId(),
        childrenIds: [],
        type: nodeTypesConstant[node.type].childOptions[0],
        label: '',
        parentId: node.id,
        expand: false,
        ...exampleNode,
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
    setCopyItem,
    setPasteItem,
    getHigherLevelNodes,
    setBlockNode,
  };
};
