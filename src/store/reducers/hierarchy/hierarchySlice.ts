/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { firstNodeId } from 'core/constants/first-node-id.constant';

import { AppState } from '../..';
import { TreeTypeEnum } from '../../../components/organisms/main/Tree/OrgTree/enums/tree-type.enums';
import {
  ITreeMap,
  ITreeMapEdit,
  ITreeMapObject,
  ITreeMapPartial,
  ITreeSelectedItem,
  ITreeCopyItem,
} from '../../../components/organisms/main/Tree/OrgTree/interfaces';

interface IHierarchySlice {
  nodes: ITreeMap;
  dragItem: ITreeMapObject | null;
  copyItem: ITreeCopyItem | null;
  selectItem: ITreeSelectedItem | null;
}

const initialState: IHierarchySlice = {
  nodes: {
    [firstNodeId]: {
      id: firstNodeId,
      label: 'Click para editar',
      parentId: null,
      childrenIds: [],
      type: TreeTypeEnum.COMPANY,
      expand: false,
      ghos: [],
    },
  },
  dragItem: null,
  copyItem: null,
  selectItem: null,
};

const name = 'hierarchy';

export const hierarchySlice = createSlice({
  name,
  initialState,
  reducers: {
    setMapHierarchyTree: (state, action: PayloadAction<ITreeMap>) => {
      state.nodes = action.payload;
    },
    setEditMapHierarchyTreeNode: (
      state,
      action: PayloadAction<ITreeMapPartial>,
    ) => {
      Object.keys(action.payload).forEach((key) => {
        state.nodes[key] = { ...state.nodes[key], ...action.payload[key] };
      });
    },
    setEditNodes: (state, action: PayloadAction<ITreeMapEdit[]>) => {
      action.payload.forEach((node) => {
        state.nodes[node.id] = {
          ...state.nodes[node.id],
          ...node,
        };
      });
    },
    setAddNodes: (state, action: PayloadAction<ITreeMapObject[]>) => {
      action.payload.forEach((node) => {
        if (node.parentId) {
          state.nodes[node.parentId].childrenIds = [
            ...state.nodes[node.parentId].childrenIds,
            node.id,
          ];
          state.nodes[node.id] = {
            ...node,
          };
        }
      });
    },
    setCreateNodes: (state, action: PayloadAction<ITreeMapEdit[]>) => {
      action.payload.forEach((node) => {
        if (state.nodes[node.id])
          state.nodes[node.id] = {
            ...state.nodes[node.id],
            ...node,
          };
      });
    },
    setRemoveNode: (state, action: PayloadAction<Array<string | number>>) => {
      const loopRemoveChild = (childIds: Array<string | number>) => {
        childIds.forEach((nodeId) => {
          loopRemoveChild(state.nodes[nodeId].childrenIds);
          delete state.nodes[nodeId];
        });
      };

      action.payload.forEach((nodeId) => {
        if (state.nodes[nodeId]) {
          const parentId = state.nodes[nodeId].parentId;
          if (parentId) {
            state.nodes[parentId].childrenIds = state.nodes[
              parentId
            ].childrenIds.filter((id) => id !== nodeId);
            loopRemoveChild(state.nodes[nodeId].childrenIds);
            delete state.nodes[nodeId];
          }
        }
      });
    },
    setDragItem: (state, action: PayloadAction<ITreeMapObject | null>) => {
      state.dragItem = action.payload;
    },
    setSelectCopy: (state, action: PayloadAction<ITreeCopyItem | null>) => {
      state.copyItem = action.payload;
    },
    setSelectItem: (state, action: PayloadAction<ITreeSelectedItem | null>) => {
      state.selectItem = action.payload;
    },
    setEditSelectItem: (
      state,
      action: PayloadAction<Partial<ITreeSelectedItem> | null>,
    ) => {
      if (state.selectItem)
        state.selectItem = { ...state.selectItem, ...action.payload };
    },
    setReorder: (
      state,
      action: PayloadAction<{ id: string | number; move: 'up' | 'down' }>,
    ) => {
      const { id, move } = action.payload;

      const node = state.nodes[id];
      if (node.parentId) {
        const childrenIds = [...state.nodes[node.parentId].childrenIds];
        const fromIndex = childrenIds.indexOf(id);
        const toIndex = move === 'up' ? fromIndex - 1 : fromIndex + 1;

        if (fromIndex >= 0 && toIndex >= 0 && toIndex < childrenIds.length) {
          childrenIds.splice(fromIndex, 1);
          childrenIds.splice(toIndex, 0, id);

          state.nodes[node.parentId].childrenIds = childrenIds;
        }
      }
    },
    setExpandAll: (
      state,
      action: PayloadAction<{
        nodeId: string | number | undefined;
        expand: boolean;
      }>,
    ) => {
      const loop = (nodeId: string | number) => {
        state.nodes[nodeId].expand = action.payload.expand;
        state.nodes[nodeId].childrenIds.forEach((childId) => {
          loop(childId);
        });
      };

      loop(action.payload.nodeId || firstNodeId);
    },
  },
});

export const TreeName = name;

export const {
  setEditMapHierarchyTreeNode,
  setDragItem,
  setEditNodes,
  setAddNodes,
  setRemoveNode,
  setExpandAll,
  setMapHierarchyTree,
  setSelectItem,
  setEditSelectItem,
  setSelectCopy,
  setReorder,
} = hierarchySlice.actions;

export const selectAllHierarchyTreeNodes = (state: AppState) =>
  state[name].nodes;

export const selectHierarchyTreeData =
  (id: string | number) => (state: AppState) =>
    state[name].nodes[id];

export const selectHierarchyTreeDragItem = (state: AppState) =>
  state[name].dragItem;
export const selectHierarchyTreeSelectItem = (state: AppState) =>
  state[name].selectItem;
export const selectHierarchyTreeCopyItem = (state: AppState) =>
  state[name].copyItem;

export default hierarchySlice.reducer;
