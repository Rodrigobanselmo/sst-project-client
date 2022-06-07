/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';

export interface IGhoMultiState {
  selectedIds: string[];
}

const initialState: IGhoMultiState = {
  selectedIds: [],
};

const name = 'ghoMulti';

export const ghoMultiSlice = createSlice({
  name,
  initialState,
  reducers: {
    setGhoMultiState: (
      state,
      action: PayloadAction<Partial<IGhoMultiState>>,
    ) => {
      return { ...state, ...action.payload };
    },
    setGhoMultiEditId: (state, action: PayloadAction<string>) => {
      const id = action.payload;

      if (!state.selectedIds.find((reduxId) => reduxId === id))
        state.selectedIds = [...state.selectedIds, id];
      else
        state.selectedIds = state.selectedIds.filter(
          (reduxId) => reduxId !== id,
        );
    },
    setGhoMultiEditIds: (state, action: PayloadAction<string | string[]>) => {
      const hierarchies = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      hierarchies.map((hierarchy) => {
        if (!state.selectedIds.find((h) => h === hierarchy))
          state.selectedIds = [...state.selectedIds, hierarchy];
        else
          state.selectedIds = state.selectedIds.filter((h) => h !== hierarchy);
      });
    },
    setGhoMultiRemoveIds: (state, action: PayloadAction<string>) => {
      state.selectedIds = state.selectedIds.filter((h) => h !== action.payload);
    },
  },
});

export const SaveName = name;

export const {
  setGhoMultiState,
  setGhoMultiEditIds,
  setGhoMultiRemoveIds,
  setGhoMultiEditId,
} = ghoMultiSlice.actions;

export const selectGhoMultiIds = (state: AppState) =>
  state.ghoMulti.selectedIds;

export const selectGhoMultiId = (ghoId: string) => (state: AppState) =>
  state.ghoMulti.selectedIds.findIndex((id) => id === ghoId) >= 0;

export default ghoMultiSlice.reducer;
