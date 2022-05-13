/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { AppState } from '../..';

export interface IRiskAddState {
  init: boolean;
  expanded: boolean;
  risk: IRiskFactors | null;
}

const initialState: IRiskAddState = {
  init: false,
  expanded: false,
  risk: null,
};

const name = 'riskAdd';

export const riskAddSlice = createSlice({
  name,
  initialState,
  reducers: {
    setRiskAddState: (state, action: PayloadAction<Partial<IRiskAddState>>) => {
      return { ...state, ...action.payload };
    },
    setRiskAddInit: (state, action: PayloadAction<boolean | undefined>) => {
      if (action.payload === undefined) state.init = !state.init;
      else state.init = action.payload;
    },
    setRiskAddToggleExpand: (
      state,
      action: PayloadAction<boolean | undefined>,
    ) => {
      if (action.payload === undefined) state.expanded = !state.expanded;
      else state.expanded = action.payload;
    },
  },
});

export const SaveName = name;

export const { setRiskAddState, setRiskAddInit, setRiskAddToggleExpand } =
  riskAddSlice.actions;

export const selectRiskAddInit = (state: AppState) => state.riskAdd.init;
export const selectRisk = (state: AppState) => state.riskAdd.risk;
export const selectRiskAddExpand = (state: AppState) => state.riskAdd.expanded;

export default riskAddSlice.reducer;
