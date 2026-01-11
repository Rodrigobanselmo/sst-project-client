/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback } from 'react';
import { useStore } from 'react-redux';

import clone from 'clone';
import { nodeTypesConstant } from 'components/organisms/main/Tree/OrgTree/constants/node-type.constant';
import { TreeTypeEnum } from 'components/organisms/main/Tree/OrgTree/enums/tree-type.enums';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import sortArray from 'sort-array';
import { setDocSaved, setDocUnsaved } from 'store/reducers/save/saveSlice';
import { v4 } from 'uuid';

import { firstNodeId } from 'core/constants/first-node-id.constant';
import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { SaveEnum } from 'core/enums/save.enum';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IGho } from 'core/interfaces/api/IGho';
import { IHierarchy, IHierarchyMap } from 'core/interfaces/api/IHierarchy';
import { useMutUpdateChecklist } from 'core/services/hooks/mutations/checklist/checklist/useMutUpdateChecklist';
import { useMutDeleteHierarchy } from 'core/services/hooks/mutations/checklist/hierarchy/useMutDeleteHierarchy';
import { useMutUpsertManyHierarchy } from 'core/services/hooks/mutations/checklist/hierarchy/useMutUpsertManyHierarchy';
import { queryClient } from 'core/services/queryClient';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';
import { stringNormalize } from 'core/utils/strings/stringNormalize';

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
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const store = useStore<any>();

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

  const getChildren = useCallback(
    (id: number | string) => {
      const children: ITreeMap = {} as ITreeMap;
      const nodes = store.getState().hierarchy.nodes as ITreeMap;

      const loop = (id: number | string) => {
        const node = nodes[id];

        node.childrenIds.forEach((childId) => {
          const nodeChild = nodes[childId];

          if (nodeChild) {
            children[childId] = nodeChild;
            loop(childId);
          }
        });
      };

      loop(id);

      return children;
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
          console.info(error);
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
      options?: {
        allExpanded?: boolean;
        showRef?: boolean;
        stopDrag?: boolean;
        companyIdCopy?: string;
        copyHierarchyMap?: IHierarchyMap;
      },
    ): ITreeMap => {
      const treeMap = {} as ITreeMap;
      const nodesTree = store.getState().hierarchy.nodes as ITreeMap;

      // refName
      const copyFromHierarchy = options?.copyHierarchyMap;
      const companyIdCopy = options?.companyIdCopy;

      const copyFromHierarchyKeyName = {} as IHierarchyMap;
      if (copyFromHierarchy) {
        Object.values(copyFromHierarchy).forEach((value) => {
          copyFromHierarchyKeyName[value.id] = value;
          copyFromHierarchyKeyName[
            stringNormalize(value.name) + '//' + value.type
          ] = value;
        });
      }

      const getHierarchyCopyFrom = (actualHierarchy?: IHierarchy) => {
        if (copyFromHierarchy && actualHierarchy) {
          let hierarchyFromCopy: IHierarchy | false = false;
          const copyHierarchy =
            copyFromHierarchyKeyName[`${actualHierarchy?.refName}`];

          if (copyHierarchy) {
            hierarchyFromCopy = copyHierarchy;
          }

          if (hierarchyFromCopy) return hierarchyFromCopy;

          const byNameAndType =
            copyFromHierarchyKeyName[
              stringNormalize(actualHierarchy.name) +
                '//' +
                actualHierarchy.type
            ];

          if (byNameAndType) return byNameAndType;

          return {} as Partial<IHierarchy>;
        }
      };
      // refName

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
        showRef: !!options?.showRef,
        ghos: [],
      };

      if (company.workspace) {
        company.workspace.map((workspace) => {
          treeMap[workspace.id] = {
            id: workspace.id,
            label: workspace.name,
            parentId: firstNodeId,
            childrenIds: [],
            type: TreeTypeEnum.WORKSPACE,
            showRef: !!options?.showRef,
            expand: true,
            ghos: [],
          };

          treeMap[firstNodeId].childrenIds.push(workspace.id);
        });

        // Sort workspaces alphabetically
        treeMap[firstNodeId].childrenIds = sortArray(
          treeMap[firstNodeId].childrenIds,
          {
            by: 'name',
            order: 'asc',
            computed: {
              name: (workspaceId) => treeMap[workspaceId]?.label || '',
            },
          },
        );

        Object.values(hierarchyMap).forEach((values, index) => {
          values.workspaceIds.map((workspaceId) => {
            const hierarchyCopy = getHierarchyCopyFrom(values);

            treeMap[`${values.id}//${workspaceId}`] = {
              id: `${values.id}//${workspaceId}`,
              label: values.name,
              stopDrag: options?.stopDrag || false,
              idRef: hierarchyCopy?.id || '',
              copyCompanyId: companyIdCopy,
              childrenIds: sortArray(values.children, {
                by: 'name',
                order: 'asc',
                computed: {
                  name: (row) => hierarchyMap[row].name,
                },
              })
                .map((child) =>
                  hierarchyMap[child].workspaceIds.includes(workspaceId)
                    ? `${child}//${workspaceId}`
                    : '',
                )
                .filter((id) => id),
              expand: options?.allExpanded ? true : index != 0 ? false : true,
              showRef: !!options?.showRef,
              parentId: values.parentId
                ? `${values.parentId}//${workspaceId}`
                : workspaceId,
              realDescription: values?.realDescription ?? undefined,
              description: values.description,
              type: TreeTypeEnum[values.type] as unknown as TreeTypeEnum,
              ghos: ghos.filter(
                (gho) =>
                  gho.hierarchies &&
                  gho.hierarchies.some(
                    (hierarchy) => values.id === hierarchy.id,
                  ),
              ),
            };

            if (!values.parentId && treeMap[workspaceId])
              treeMap[workspaceId].childrenIds = [
                ...treeMap[workspaceId].childrenIds,
                `${values.id}//${workspaceId}`,
              ];
          });
          values.workspaceIds.map((workspaceId) => {
            treeMap[workspaceId].childrenIds = sortArray(
              treeMap?.[workspaceId]?.childrenIds || [],
              {
                by: 'name',
                order: 'asc',
                computed: {
                  name: (row) =>
                    hierarchyMap[(row as any)?.split('//')[0]]?.name,
                },
              },
            );
          });
        });
      }

      if (nodesTree)
        Object.values(nodesTree).forEach((node) => {
          if (treeMap[node.id]) {
            if (node.id !== firstNodeId) {
              treeMap[node.id].expand = options?.allExpanded
                ? true
                : node.expand;
            }
          }
        });

      return treeMap;
    },
    [store],
  );

  const editTreeMap = useCallback(
    (nodesMap: ITreeMapPartial, noSave?: boolean) => {
      dispatch(setEditMapHierarchyTreeNode(nodesMap));
      if (!noSave) saveApi();
    },
    [dispatch, saveApi],
  );

  const editNodes = useCallback(
    async (
      nodesMap: ITreeMapEdit[],
      noSave?: boolean,
      options?: {
        isAdd?: boolean;
        employeesIds?: number[];
        workspacesIds?: string[];
        callBack?: () => void;
      },
    ) => {
      const isDiffWorkspace = () => {
        if (nodesMap.length != 3) return false;

        if (
          !((nodesMap?.[0]?.id as string) || '').split('//')[1] &&
          !((nodesMap?.[2]?.id as string) || '').split('//')[1]
        ) {
          const isMovingToAnyCardAndIsSameWorkspace =
            ((nodesMap?.[0]?.id as string) || '').split('//')[0] ==
            ((nodesMap?.[2]?.id as string) || '').split('//')[0];

          if (!isMovingToAnyCardAndIsSameWorkspace) return true;
        } else if (!((nodesMap?.[2]?.id as string) || '').split('//')[1]) {
          const isMovingToWorkspaceCardAndIsSameWorkspace =
            ((nodesMap?.[0]?.id as string) || '').split('//')[1] ==
            ((nodesMap?.[2]?.id as string) || '').split('//')[0];

          if (!isMovingToWorkspaceCardAndIsSameWorkspace) return true;
        } else if (!((nodesMap?.[0]?.id as string) || '').split('//')[1]) {
          const isMovingToWorkspaceCardAndIsSameWorkspace =
            ((nodesMap?.[0]?.id as string) || '').split('//')[0] ==
            ((nodesMap?.[2]?.id as string) || '').split('//')[1];

          if (!isMovingToWorkspaceCardAndIsSameWorkspace) return true;
        } else {
          const isMovingToAnyCardAndIsSameWorkspace =
            ((nodesMap?.[0]?.id as string) || '').split('//')[1] ==
            ((nodesMap?.[2]?.id as string) || '').split('//')[1];

          if (!isMovingToAnyCardAndIsSameWorkspace) return true;
        }

        return false;
      };

      if (isDiffWorkspace())
        return enqueueSnackbar(
          'Não é possivel editar o estabelecomento dessa forma, utilize a edição pelo card.',
          {
            variant: 'error',
            autoHideDuration: 3000,
          },
        );

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

        const oldNodes = queryHierarchy as IHierarchyMap;

        const nodes = transformToTreeMap(
          oldNodes,
          queryCompany as ICompany,
        ) as ITreeMap;

        const workspaceId = (node: ITreeMapEdit) =>
          String(getPathById(node.id)[1]);

        const data = nodesMap
          .filter((node) => !node.childrenIds || node.label)
          .map((node) => {
            const [id] = ((node.id as string) || '').split('//');
            const [parentId] = ((node.parentId as string) || '').split('//');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: any = {
              id: id,
              type: (node.type as unknown as HierarchyEnum) || undefined,
              name: node.label ? node.label : undefined,
              description: node?.description ?? undefined,
              realDescription: node?.realDescription ?? undefined,
              parentId: [workspaceId(node), 'seed'].includes(parentId)
                ? null
                : parentId,
            };

            if (options?.isAdd) data.workspaceIds = [workspaceId(node)];
            if (options?.workspacesIds)
              data.workspaceIds = removeDuplicate([
                workspaceId(node),
                ...options.workspacesIds,
              ]);

            return data;
          });

        saveApi(
          () =>
            upsertManyMutation
              .mutateAsync(
                data.map((hierarchy) => ({
                  ...hierarchy,
                  employeesIds: options?.employeesIds,
                })),
              )
              .then(() => {
                options?.callBack?.();
              }),
          nodes,
        );
      }
    },
    [
      dispatch,
      enqueueSnackbar,
      getPathById,
      router.query.companyId,
      saveApi,
      transformToTreeMap,
      upsertManyMutation,
    ],
  );

  const addNodes = useCallback(
    (nodesMap: ITreeMapObject[], noSave?: boolean) => {
      dispatch(setAddNodes(nodesMap));
      if (!noSave) saveApi();
    },
    [dispatch, saveApi],
  );

  const removeNodes = useCallback(
    async (idToRemove: number | string, noSave?: boolean) => {
      const nodes = store.getState().hierarchy.nodes as ITreeMap;
      const [idApi] = ((idToRemove as string) || '').split('//');

      const idsToRemove = Object.keys(nodes).filter((key) =>
        key.includes(idApi),
      );

      dispatch(setRemoveNode(idsToRemove));
      if (!noSave) saveApi(() => deleteMutation.mutateAsync(idApi), nodes);
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
    const workspaceId = ((parentId as string) || '').split('//')[1] || '';

    if (node) {
      const newNode = {
        id: `${getUniqueId()}//${workspaceId}`,
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

  const searchFilterNodes = (search = '') => {
    const nodes = clone(store.getState().hierarchy.nodes) as ITreeMap;
    // const search = store.getState().hierarchy.search as string || '';

    if (typeof search != 'string') return;

    const normalizedSearch = stringNormalize(search);
    const matchesIds: string[] = [];
    Object.entries(nodes).forEach(([nodeId, node]) => {
      // Exclude only COMPANY from filtering, include WORKSPACE
      if (node.type === TreeTypeEnum.COMPANY) return;

      if (!nodes[nodeId]) return;
      if (!search) {
        nodes[nodeId].hide = false;
        nodes[nodeId].searchExpand = false;
        return;
      }

      const isHide = !stringNormalize(node.label).includes(normalizedSearch);
      if (node.searchExpand) nodes[nodeId].searchExpand = false;
      if (isHide) nodes[nodeId].hide = true;
      if (!isHide) {
        matchesIds.push(nodeId);
        nodes[nodeId].hide = false;
      }
    });

    matchesIds.forEach((nodeId) => {
      nodes[nodeId].search = search;
      nodes[nodeId].searchExpand = matchesIds.length < 10;
      getPathById(nodeId).forEach((parentId) => {
        nodes[parentId].searchExpand = true;
        nodes[parentId].hide = false;
      });

      Object.entries(getChildren(nodeId)).forEach(([childId, child]) => {
        nodes[childId].hide = false;
      });
    });

    return setTree(nodes);
  };

  return {
    setTree,
    isChild,
    searchFilterNodes,
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
    getChildren,
  };
};

export type IUseHierarchyTreeActions = ReturnType<
  typeof useHierarchyTreeActions
>;
