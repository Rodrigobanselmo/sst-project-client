/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback } from 'react';
import { useStore } from 'react-redux';

import { nodeTypesConstant } from 'components/organisms/main/Tree/OrgTree/constants/node-type.constant';
import { TreeTypeEnum } from 'components/organisms/main/Tree/OrgTree/enums/tree-type.enums';
import { useRouter } from 'next/router';
import { setDocSaved, setDocUnsaved } from 'store/reducers/save/saveSlice';
import { v4 } from 'uuid';

import { firstNodeId } from 'core/constants/first-node-id.constant';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { SaveEnum } from 'core/enums/save.enum';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchyMap } from 'core/interfaces/api/IHierarchy';
import { useMutDeleteHierarchy } from 'core/services/hooks/mutations/checklist/useMutDeleteHierarchy';
import { useMutUpdateChecklist } from 'core/services/hooks/mutations/checklist/useMutUpdateChecklist';
import { useMutUpsertManyHierarchy } from 'core/services/hooks/mutations/checklist/useMutUpsertManyHierarchy';
import { queryClient } from 'core/services/queryClient';

import {
  ITreeCopyItem,
  ITreeMap,
  ITreeMapEdit,
  ITreeMapObject,
  ITreeMapPartial,
} from '../../components/organisms/main/Tree/OrgTree/interfaces';
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
  setWorkplaceId,
} from '../../store/reducers/hierarchy/hierarchySlice';
import { useAppDispatch } from './useAppDispatch';

export const useHierarchyTreeActions = () => {
  const dispatch = useAppDispatch();
  const saveMutation = useMutUpdateChecklist(); //! change
  const deleteMutation = useMutDeleteHierarchy();
  const upsertManyMutation = useMutUpsertManyHierarchy();
  const router = useRouter();
  const store = useStore();

  const setTree = useCallback(
    (nodesMap: ITreeMap) => {
      dispatch(setMapHierarchyTree(nodesMap));
    },
    [dispatch],
  );

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

  const saveApi = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (cb?: () => Promise<any>, nodes?: ITreeMap) => {
      dispatch(setDocUnsaved({ docName: SaveEnum.HIERARCHY }));

      if (cb && nodes) {
        try {
          await cb();
        } catch (error) {
          console.log(error);
          setTree(nodes);
        }
      }

      dispatch(setDocSaved({ docName: SaveEnum.HIERARCHY }));
    },
    [dispatch, setTree],
  );

  const getUniqueId = useCallback((): string => {
    return v4();
  }, []);

  const transformToTreeMap = useCallback(
    (
      hierarchyMap: IHierarchyMap,
      company: ICompany,
      workspaceIdProp?: string,
    ): ITreeMap => {
      const treeMap = {} as ITreeMap;
      const nodesTree = store.getState().hierarchy.nodes as ITreeMap;

      const workspaceId =
        workspaceIdProp || (store.getState().hierarchy.workspaceId as string);

      const ghos =
        queryClient.getQueryData<IGho[]>([QueryEnum.GHO, company.id]) ||
        ([] as IGho[]);

      treeMap[firstNodeId] = {
        id: firstNodeId,
        label: company.name,
        parentId: null,
        childrenIds: [],
        type: TreeTypeEnum.COMPANY,
        expand: true,
        ghos: [],
      };

      if (company.workspace) {
        if (company.workspace.length)
          dispatch(setWorkplaceId(workspaceId || company.workspace[0].id));

        company.workspace.map((workspace) => {
          treeMap[workspace.id] = {
            id: workspace.id,
            label: workspace.name,
            parentId: firstNodeId,
            childrenIds: [],
            type: TreeTypeEnum.WORKSPACE,
            expand: true,
            ghos: [],
          };

          treeMap[firstNodeId].childrenIds.push(workspace.id);
        });
        Object.values(hierarchyMap).forEach((values) => {
          const workspaceIdValue = values.workspaceIds.includes(
            workspaceId || '',
          )
            ? workspaceId || values.workspaceIds[0]
            : values.workspaceIds[0];

          treeMap[values.id] = {
            id: values.id,
            label: values.name,
            childrenIds: values.children,
            expand: true,
            parentId: values.parentId || workspaceIdValue,
            type: TreeTypeEnum[values.type] as unknown as TreeTypeEnum,
            ghos: ghos.filter(
              (gho) =>
                gho.hierarchies &&
                gho.hierarchies.some((hierarchy) => values.id === hierarchy.id),
            ),
          };

          if (!values.parentId && treeMap[workspaceIdValue])
            treeMap[workspaceIdValue].childrenIds = [
              ...treeMap[workspaceIdValue].childrenIds,
              values.id,
            ];
        });
      }

      if (nodesTree)
        Object.values(nodesTree).forEach((node) => {
          if (treeMap[node.id]) {
            if (node.id !== firstNodeId) {
              treeMap[node.id].expand = node.expand;
            }
          }
        });

      return treeMap;
    },
    [dispatch, store],
  );

  const editTreeMap = useCallback(
    (nodesMap: ITreeMapPartial, noSave?: boolean) => {
      dispatch(setEditMapHierarchyTreeNode(nodesMap));
      if (!noSave) saveApi();
    },
    [dispatch, saveApi],
  );

  const editNodes = useCallback(
    async (nodesMap: ITreeMapEdit[], noSave?: boolean) => {
      dispatch(setEditNodes(nodesMap));

      if (!noSave) {
        const company = router.query.companyId;

        const queryHierarchy = queryClient.getQueryData<IHierarchyMap>([
          QueryEnum.HIERARCHY,
          company,
        ]);

        const queryCompany = queryClient.getQueryData<ICompany>([
          QueryEnum.COMPANY,
          company,
        ]);

        const workspaceId = (node: ITreeMapEdit) =>
          String(getPathById(node.id)[1]);

        const nodes = transformToTreeMap(
          queryHierarchy as IHierarchyMap,
          queryCompany as ICompany,
        ) as ITreeMap;

        const data = nodesMap
          .filter((node) => !node.childrenIds || node.label)
          .map((node) => ({
            id: node.id as string,
            type: (node.type as unknown as HierarchyEnum) || undefined,
            name: node.label ? node.label : undefined,
            workspaceIds: [workspaceId(node)],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parentId: [workspaceId(node), 'seed'].includes(node.parentId as any)
              ? null
              : (node.parentId as string),
          }));

        saveApi(() => upsertManyMutation.mutateAsync(data), nodes);
      }
    },
    [
      dispatch,
      getPathById,
      router.query.companyId,
      saveApi,
      transformToTreeMap,
      upsertManyMutation,
    ],
  );

  const editWorkspaceNodes = useCallback(
    async (workspaceId: string) => {
      const company = router.query.companyId;

      const queryHierarchy = queryClient.getQueryData<IHierarchyMap>([
        QueryEnum.HIERARCHY,
        company,
      ]);

      const queryCompany = queryClient.getQueryData<ICompany>([
        QueryEnum.COMPANY,
        company,
      ]);

      const nodes = transformToTreeMap(
        queryHierarchy as IHierarchyMap,
        queryCompany as ICompany,
        workspaceId,
      ) as ITreeMap;

      setTree(nodes);
    },
    [router.query.companyId, setTree, transformToTreeMap],
  );

  const addNodes = useCallback(
    (nodesMap: ITreeMapObject[], noSave?: boolean) => {
      dispatch(setAddNodes(nodesMap));
      if (!noSave) saveApi();
    },
    [dispatch, saveApi],
  );

  const removeNodes = useCallback(
    async (id: number | string, noSave?: boolean) => {
      const nodes = store.getState().hierarchy.nodes as ITreeMap;

      dispatch(setRemoveNode([id]));
      if (!noSave)
        saveApi(() => deleteMutation.mutateAsync(id as string), nodes);
    },
    [deleteMutation, dispatch, saveApi, store],
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
        ghos: [],
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
    editWorkspaceNodes,
  };
};

export type IUseHierarchyTreeActions = ReturnType<
  typeof useHierarchyTreeActions
>;
