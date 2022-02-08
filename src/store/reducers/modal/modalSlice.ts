/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';
import { ITagAction } from '../../../components/atoms/STag/types';

export interface IModalDataSlice {
  title: string;
  text: string;
  confirmText: string;
  tag?: ITagAction;
  confirmCancel: string;
}
interface IModalSlice {
  currentModal: string[];
  pileModal: string[];
  action: boolean;
  globalModal: boolean;
  data: IModalDataSlice;
}

const initialState: IModalSlice = {
  currentModal: [],
  pileModal: [],
  globalModal: false,
  action: false,
  data: {
    title: '',
    text: '',
    confirmText: 'Continuar',
    confirmCancel: 'Cancelar',
    tag: 'none',
  },
};

const name = 'modal';

export const modalSlice = createSlice({
  name,
  initialState,
  reducers: {
    setModalName: (state, action: PayloadAction<string[]>) => {
      state.currentModal = action.payload;
    },
    setPileModalName: (state, action: PayloadAction<string[]>) => {
      state.pileModal = action.payload;
    },
    setModalData: (state, action: PayloadAction<IModalDataSlice>) => {
      state.data = action.payload;
    },
    setModalAction: (state, action: PayloadAction<boolean>) => {
      state.action = action.payload;
    },
    setModalGlobal: (state, action: PayloadAction<boolean>) => {
      state.globalModal = action.payload;
    },
  },
});

export const ModalName = name;

export const {
  setModalName,
  setModalData,
  setModalAction,
  setModalGlobal,
  setPileModalName,
} = modalSlice.actions;

export const selectCurrentModal = (state: AppState) => state[name].currentModal;
export const selectModalData = (state: AppState) => state[name].data;
export const selectModalAction = (state: AppState) => state[name].action;
export const selectModalGlobal = (state: AppState) => state[name].globalModal;

export default modalSlice.reducer;
