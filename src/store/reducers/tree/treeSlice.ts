/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';
import {
  ITreeMap,
  ITreeMapEdit,
  ITreeMapObject,
  ITreeMapPartial,
  ITreeSelectedItem,
} from '../../../components/main/OrgTree/interfaces';
import { TreeTypeEnum } from '../../../core/enums/tree-type.enums';

interface ITreeSlice {
  nodes: ITreeMap;
  dragItem: ITreeMapObject | null;
  selectItem: ITreeSelectedItem | null;
}

const initialState: ITreeSlice = {
  nodes: {
    seed: {
      id: 'principal',
      label: 'Click para editar',
      parentId: null,
      childrenIds: [],
      type: TreeTypeEnum.CHECKLIST,
      expand: false,
    },
  },
  dragItem: null,
  selectItem: null,
};

const name = 'tree';

export const treeSlice = createSlice({
  name,
  initialState,
  reducers: {
    setMapTree: (state, action: PayloadAction<ITreeMap>) => {
      state.nodes = action.payload;
    },
    setEditMapTreeNode: (state, action: PayloadAction<ITreeMapPartial>) => {
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
    setEditRisks: (state, action: PayloadAction<ITreeMapEdit>) => {
      const node = action.payload;
      const oldRisks = state.nodes[node.id].risks;
      if (oldRisks && node.risks) {
        state.nodes[node.id].risks = [...oldRisks, ...node.risks];
      }
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

      loop(action.payload.nodeId || 'principal');
    },
  },
});

export const TreeName = name;

export const {
  setEditMapTreeNode,
  setDragItem,
  setEditNodes,
  setAddNodes,
  setRemoveNode,
  setExpandAll,
  setMapTree,
  setSelectItem,
  setEditSelectItem,
} = treeSlice.actions;

export const selectAllTreeNodes = (state: AppState) => state[name].nodes;

export const selectTreeData = (id: string | number) => (state: AppState) =>
  state[name].nodes[id];

export const selectTreeDragItem = (state: AppState) => state[name].dragItem;
export const selectTreeSelectItem = (state: AppState) => state[name].selectItem;

export default treeSlice.reducer;
