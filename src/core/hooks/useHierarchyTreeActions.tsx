/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback } from 'react';
import { useStore } from 'react-redux';

import { nodeTypesConstant } from 'components/main/Tree/OrgTree/constants/node-type.constant';
import { TreeTypeEnum } from 'components/main/Tree/OrgTree/enums/tree-type.enums';
import { setDocSaved, setDocUnsaved } from 'store/reducers/save/saveSlice';
import { v4 } from 'uuid';

import { firstNodeId } from 'core/constants/first-node-id.constant';
import { SaveEnum } from 'core/enums/save.enum';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IHierarchyMap } from 'core/interfaces/api/IHierarchy';
import { useMutUpdateChecklist } from 'core/services/hooks/mutations/useMutUpdateChecklist';

import {
  ITreeCopyItem,
  ITreeMap,
  ITreeMapEdit,
  ITreeMapObject,
  ITreeMapPartial,
} from '../../components/main/Tree/OrgTree/interfaces';
import {
  setAddNodes,
  setDragItem,
  setEditMapHierarchyTreeNode,
  setEditNodes,
  setExpandAll,
  setMapHierarchyTree,
  setRemoveNode,
  setReorder,
  setSelectCopy,
  setSelectItem,
} from '../../store/reducers/hierarchy/hierarchySlice';
import { useAppDispatch } from './useAppDispatch';

export const useHierarchyTreeActions = () => {
  const dispatch = useAppDispatch();
  const saveMutation = useMutUpdateChecklist();
  const store = useStore();

  const saveApi = useCallback(async () => {
    dispatch(setDocUnsaved({ docName: SaveEnum.HIERARCHY }));

    dispatch(setDocSaved({ docName: SaveEnum.HIERARCHY }));
  }, [dispatch]);

  const getUniqueId = useCallback((): string => {
    return v4();
  }, []);

  const transformToTreeMap = useCallback(
    (hierarchyMap: IHierarchyMap, company: ICompany): ITreeMap => {
      const treeMap = {} as ITreeMap;

      treeMap[firstNodeId] = {
        id: firstNodeId,
        label: company.name,
        parentId: null,
        childrenIds: [],
        type: TreeTypeEnum.COMPANY,
        expand: true,
      };

      Object.values(hierarchyMap).forEach((values) => {
        treeMap[values.id] = {
          id: values.id,
          label: values.name,
          childrenIds: values.children,
          expand: true,
          parentId: values.parentId || firstNodeId,
          type: TreeTypeEnum[values.type] as unknown as TreeTypeEnum,
        };

        if (!values.parentId) treeMap[firstNodeId].childrenIds.push(values.id);
      });

      return treeMap;
    },
    [],
  );

  const setTree = useCallback(
    (nodesMap: ITreeMap) => {
      dispatch(setMapHierarchyTree(nodesMap));
    },
    [dispatch],
  );

  const editTreeMap = useCallback(
    (nodesMap: ITreeMapPartial, noSave?: boolean) => {
      dispatch(setEditMapHierarchyTreeNode(nodesMap));
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
      const nodes = store.getState().hierarchy.nodes as ITreeMap;

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
      const nodes = store.getState().hierarchy.nodes as ITreeMap;
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
      const treeData = store.getState().hierarchy.nodes;
      const cloneTree: ITreeMap = { [parentId]: { ...treeData[parentId] } };

      const loop = (
        id: number | string,
        _parentId: number | string,
        isFirst?: boolean,
      ) => {
        const node = treeData[id] as ITreeMapObject | null;
        const cloneNodeParent = cloneTree[_parentId] as ITreeMapObject | null;

        if (node) {
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
    const node = store.getState().hierarchy.nodes[parentId] as ITreeMapObject;

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
    saveMutation,
    reorderNodes,
    transformToTreeMap,
  };
};
