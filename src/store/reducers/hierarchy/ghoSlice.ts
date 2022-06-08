/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IGho } from 'core/interfaces/api/IGho';

import { AppState } from '../..';

export interface IGhoState {
  open: boolean;
  searchSelect: string;
  filter: {
    key: string;
    value: string;
  };
  search: string;
  data: IGho | null;
  hierarchies: string[];
}

const initialState: IGhoState = {
  hierarchies: [],
  search: '',
  searchSelect: '',
  filter: {
    key: '',
    value: '',
  },
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
    setGhoFilterState: (
      state,
      action: PayloadAction<Partial<IGhoState['filter']>>,
    ) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setGhoFilterValues: (
      state,
      action: PayloadAction<{
        values: string[];
        key: string;
      }>,
    ) => {
      if (action.payload.key === state.filter.key) {
        const index = action.payload.values.findIndex(
          (value) => value === state.filter.value,
        );

        const nextValue = action.payload.values[index + 1];
        state.filter.value = nextValue || action.payload.values[0] || '';
        state.filter.key = action.payload.key;
      } else {
        state.filter.key = action.payload.key;
        state.filter.value = action.payload.values[0] || '';
      }
    },
    setGhoSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setGhoSearchSelect: (state, action: PayloadAction<string>) => {
      state.searchSelect = action.payload;
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
  setGhoSearch,
  setGhoSearchSelect,
  setGhoFilterState,
  setGhoFilterValues,
} = ghoSlice.actions;

export const selectGhoSearch = (state: AppState) => state.gho.search;
export const selectGhoFilter = (state: AppState) => state.gho.filter;
export const selectGhoSearchSelect = (state: AppState) =>
  state.gho.searchSelect;
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
