/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IGho } from 'core/interfaces/api/IGho';

import { AppState } from '../..';

export interface IGhoState {
  open: boolean;
  data: IGho | null;
  hierarchies: string[];
}

const initialState: IGhoState = {
  hierarchies: [],
  open: false,
  data: null,
};

const name = 'gho';

export const ghoSlice = createSlice({
  name,
  initialState,
  reducers: {
    setGhoState: (state, action: PayloadAction<Partial<IGhoState>>) => {
      return { ...state, ...action.payload };
    },
    setGhoOpen: (state, action: PayloadAction<boolean | undefined>) => {
      if (action.payload === undefined) state.open = !state.open;
      else state.open = action.payload;
    },
    setGhoAddHierarchy: (state, action: PayloadAction<string | string[]>) => {
      const hierarchies = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      hierarchies.map((hierarchy) => {
        if (!state.hierarchies.find((h) => h === hierarchy))
          state.hierarchies = [...state.hierarchies, hierarchy];
        else
          state.hierarchies = state.hierarchies.filter((h) => h !== hierarchy);
      });
    },
    setGhoRemoveHierarchy: (state, action: PayloadAction<string>) => {
      state.hierarchies = state.hierarchies.filter((h) => h !== action.payload);
    },
  },
});

export const SaveName = name;

export const {
  setGhoState,
  setGhoAddHierarchy,
  setGhoRemoveHierarchy,
  setGhoOpen,
} = ghoSlice.actions;

export const selectGhoOpen = (state: AppState) => state.gho.open;
export const selectGho = (state: AppState) => state.gho;
export const selectGhoData = (state: AppState) => state.gho.data;
export const selectGhoId = (state: AppState) =>
  state.gho.data ? state.gho.data.id : null;
export const selectGhoHierarchy =
  (hierarchies: string[]) => (state: AppState) =>
    hierarchies.some((hierarchyId) =>
      state.gho.hierarchies.find((id) => id === hierarchyId),
    );

export default ghoSlice.reducer;
