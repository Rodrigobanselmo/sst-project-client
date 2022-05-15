/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback } from 'react';
import { useStore } from 'react-redux';

import { nodeTypesConstant } from 'components/organisms/main/Tree/ChecklistTree/constants/node-type.constant';
import { useRouter } from 'next/router';
import { setDocSaved, setDocUnsaved } from 'store/reducers/save/saveSlice';

import { firstNodeId } from 'core/constants/first-node-id.constant';
import { SaveEnum } from 'core/enums/save.enum';
import { useMutUpdateChecklist } from 'core/services/hooks/mutations/checklist/useMutUpdateChecklist';

import {
  ITreeCopyItem,
  ITreeMap,
  ITreeMapEdit,
  ITreeMapObject,
  ITreeMapPartial,
} from '../../components/organisms/main/Tree/ChecklistTree/interfaces';
import {
  setAddNodes,
  setDragItem,
  setEditBlockingNodes,
  setEditMapTreeNode,
  setEditNodes,
  setExpandAll,
  setMapTree,
  setRemoveNode,
  setReorder,
  setSelectCopy,
  setSelectItem,
} from '../../store/reducers/tree/treeSlice';
import { randomNumber } from '../utils/helpers/randomNumber';
import { useAppDispatch } from './useAppDispatch';

export const useChecklistTreeActions = () => {
  const dispatch = useAppDispatch();
  const saveMutation = useMutUpdateChecklist();
  const router = useRouter();
  const store = useStore();

  const saveApi = useCallback(async () => {
    dispatch(setDocUnsaved({ docName: SaveEnum.CHECKLIST }));

    // saving
    const { checklistId } = router.query;
    const nodesMap = store.getState().tree.nodes as ITreeMap;

    const checklist = {
      name: nodesMap[firstNodeId].label,
      id: Number(checklistId),
      data: {
        json: JSON.stringify(nodesMap),
      },
    };

    await saveMutation.mutateAsync(checklist);

    // saved
    dispatch(setDocSaved({ docName: SaveEnum.CHECKLIST }));
  }, [dispatch, router.query, saveMutation, store]);

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
    (nodesMap: ITreeMapPartial, noSave?: boolean) => {
      dispatch(setEditMapTreeNode(nodesMap));
      if (!noSave) saveApi();
    },
    [dispatch, saveApi],
  );

  const editNodes = useCallback(
    (nodesMap: ITreeMapEdit[], noSave?: boolean) => {
      dispatch(setEditNodes(nodesMap));
      if (!noSave) saveApi();
    },
    [dispatch, saveApi],
  );

  const setBlockNode = useCallback(
    (node: ITreeMapEdit) => {
      dispatch(setEditBlockingNodes(node));
      saveApi();
    },
    [dispatch, saveApi],
  );

  const addNodes = useCallback(
    (nodesMap: ITreeMapObject[], noSave?: boolean) => {
      dispatch(setAddNodes(nodesMap));
      if (!noSave) saveApi();
    },
    [dispatch, saveApi],
  );

  const removeNodes = (
    id: Array<number | string> | number | string,
    noSave?: boolean,
  ) => {
    if (Array.isArray(id)) {
      dispatch(setRemoveNode(id));
      if (!noSave) saveApi();
      return;
    }
    dispatch(setRemoveNode([id]));
    if (!noSave) saveApi();
    return;
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

  const getAllParentRisksById = useCallback(
    (id: number | string) => {
      const nodes = store.getState().tree.nodes as ITreeMap;
      return getPathById(id).reduce((acc, nodeId) => {
        const risks = nodes[nodeId].risks || [];
        return [...acc, ...risks];
      }, [] as (string | number)[]);
    },
    [getPathById, store],
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
            block: [],
            blockedBy: [],
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

  const reorderNodes = useCallback(
    (nodeId: number | string, move: 'up' | 'down' = 'up') => {
      dispatch(setReorder({ id: nodeId, move }));
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
    parentId: string | number,
    exampleNode: Partial<ITreeMapObject> = {},
  ) => {
    const node = store.getState().tree.nodes[parentId] as ITreeMapObject;

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

      editNodes([{ id: node.id, expand: true }], true);
      addNodes([newNode], true);
      setSelectedItem(newNode, 'add');

      return newNode;
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
    saveMutation,
    reorderNodes,
    getAllParentRisksById,
  };
};
