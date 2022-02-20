/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';

interface IRouteLoadState {
  isLoadingRoute: boolean;
  isFetchingData: boolean;
  routeRedirect: string;
}

const initialState: IRouteLoadState = {
  routeRedirect: '',
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
    setRedirectRoute: (state, action: PayloadAction<string>) => {
      state.routeRedirect = action.payload;
    },
  },
});

export const exampleName = name;

export const { setIsRouteLoading, setIsFetchingData, setRedirectRoute } =
  routeLoadSlice.actions;

export const selectRouteLoad = (state: AppState) => state[name];
export const selectRedirectRoute = (state: AppState) =>
  state[name].routeRedirect;

export default routeLoadSlice.reducer;
