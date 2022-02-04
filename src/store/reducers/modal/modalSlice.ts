/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';

const initialState: string | null = null as unknown as string | null;

const name = 'modal';

export const modalSlice = createSlice({
  name,
  initialState,
  reducers: {
    setModalName: (_, action: PayloadAction<string | null>) => {
      return action.payload;
    },
  },
});

export const ModalName = name;

export const { setModalName } = modalSlice.actions;

export const selectCurrentModal = (state: AppState) => state[name];

export default modalSlice.reducer;
