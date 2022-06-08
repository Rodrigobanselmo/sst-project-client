/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

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
    setGhoMultiAddIds: (state, action: PayloadAction<string | string[]>) => {
      const hierarchies = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      hierarchies.map((hierarchy) => {
        state.selectedIds = removeDuplicate([...state.selectedIds, hierarchy]);
      });
    },
    setGhoMultiRemoveIds: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = state.selectedIds.filter(
        (h) => !action.payload.includes(h),
      );
    },
  },
});

export const SaveName = name;

export const {
  setGhoMultiState,
  setGhoMultiAddIds,
  setGhoMultiRemoveIds,
  setGhoMultiEditId,
} = ghoMultiSlice.actions;

export const selectGhoMultiIds = (state: AppState) =>
  state.ghoMulti.selectedIds;

export const selectGhoMultiId = (ghoId: string) => (state: AppState) =>
  state.ghoMulti.selectedIds.findIndex((id) => id === ghoId) >= 0;

export default ghoMultiSlice.reducer;
