/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';
import {
  ITreeMap,
  ITreeMapEdit,
  ITreeMapObject,
  ITreeMapPartial,
} from '../../../components/main/OrgTree/interfaces';

interface ITreeSlice {
  nodes: ITreeMap;
  dragItemId: ITreeMapObject | null;
}

const initialState: ITreeSlice = {
  nodes: {
    seed: {
      id: 'seed',
      label: 'Click para editar',
      parentId: null,
      childrenIds: [],
    },
  },
  dragItemId: null,
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
      action.payload.forEach((nodeId) => {
        delete state.nodes[nodeId];
      });
    },
    setDragItem: (state, action: PayloadAction<ITreeMapObject | null>) => {
      state.dragItemId = action.payload;
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

      loop(action.payload.nodeId || 'seed');
    },
  },
});

export const TreeName = name;

export const {
  setEditMapTreeNode,
  setDragItem,
  setEditNodes,
  setRemoveNode,
  setExpandAll,
  setMapTree,
} = treeSlice.actions;

export const selectTreeData = (id: string | number) => (state: AppState) =>
  state[name].nodes[id];

export const selectTreeDragItem = (state: AppState) => state[name].dragItemId;

export default treeSlice.reducer;
