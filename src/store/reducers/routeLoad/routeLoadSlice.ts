/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';

interface IRouteLoadState {
  isLoadingRoute: boolean;
  isFetchingData: boolean;
}

const initialState: IRouteLoadState = {
  isLoadingRoute: false,
  isFetchingData: false,
};

const name = 'routeLoad';

export const routeLoadSlice = createSlice({
  name,
  initialState,
  reducers: {
    setIsRouteLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingRoute = action.payload;
    },
    setIsFetchingData: (state, action: PayloadAction<boolean>) => {
      state.isFetchingData = action.payload;
    },
  },
});

export const exampleName = name;

export const { setIsRouteLoading, setIsFetchingData } = routeLoadSlice.actions;

export const selectRouteLoad = (state: AppState) => state[name];

export default routeLoadSlice.reducer;
