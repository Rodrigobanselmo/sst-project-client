/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';

interface IModalSlice {
  currentModal: string | null;
  action: string | null;
  data: {
    title: string;
    text: string;
    confirmText: string;
  };
}

const initialState: IModalSlice = {
  currentModal: null,
  action: null,
  data: {
    title: '',
    text: '',
    confirmText: 'Continuar',
  },
};

const name = 'modal';

export const modalSlice = createSlice({
  name,
  initialState,
  reducers: {
    setModalName: (state, action: PayloadAction<string | null>) => {
      state.currentModal = action.payload;
    },
  },
});

export const ModalName = name;

export const { setModalName } = modalSlice.actions;

export const selectCurrentModal = (state: AppState) => state[name].currentModal;
export const selectDataModal = (state: AppState) => state[name].data;

export default modalSlice.reducer;
