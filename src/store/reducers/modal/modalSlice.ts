/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
import { ReactNode } from 'react';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';
import { ITagAction } from '../../../components/atoms/STagAction/types';

export interface IModalDataSlice {
  title: string;
  text: ReactNode;
  confirmText: string;
  tag?: ITagAction;
  inputConfirm?: boolean;
  confirmCancel: string;
}

export interface ICurrentModal {
  name: string;
  data?: any;
}

interface IModalSlice {
  currentModal: ICurrentModal[];
  pileModal: ICurrentModal[];
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
    setModalName: (state, action: PayloadAction<ICurrentModal[]>) => {
      state.currentModal = action.payload;
    },
    setPileModalName: (state, action: PayloadAction<ICurrentModal[]>) => {
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
