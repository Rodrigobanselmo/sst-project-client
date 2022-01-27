/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';

interface ISidebarState {
  urlRouter: string;
  alwaysOpen: boolean;
  isOpen: boolean;
}

const initialState: ISidebarState = {
  urlRouter: '/',
  alwaysOpen: false,
  isOpen: true,
};

const name = 'sidebar';

export const sidebarSlice = createSlice({
  name,
  initialState,
  reducers: {
    open: (state) => {
      state.isOpen = true;
    },
    close: (state) => {
      state.isOpen = false;
    },
    toggle: (state) => {
      state.isOpen = !state.isOpen;
    },
    setUrlRouter: (state, action: PayloadAction<string>) => {
      state.urlRouter = action.payload;
    },
    setAlwaysOpen: (state, action: PayloadAction<boolean>) => {
      state.alwaysOpen = action.payload;
    },
  },
});

export const sidebarName = name;

export const { open, close, toggle, setAlwaysOpen, setUrlRouter } =
  sidebarSlice.actions;

export const selectSidebarIsOpen = (state: AppState) => state.sidebar.isOpen;
export const selectSidebarAlwaysOpen = (state: AppState) =>
  state.sidebar.alwaysOpen;
export const selectUrlRouter = (state: AppState) => state.sidebar.urlRouter;

export default sidebarSlice.reducer;
