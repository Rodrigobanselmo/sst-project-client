/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NodeDocumentModel } from 'components/organisms/documentModel/DocumentModelTree/types/types';
import { initialEditDocumentModelState } from 'components/organisms/modals/ModalEditDocumentModel/hooks/useEditDocumentModel';

import { IDocumentModelData } from 'core/interfaces/api/IDocumentModel';

import { AppState } from '../..';

export interface IDocumentSlice {
  model: IDocumentModelData | null;
  needSynchronization: boolean;
  modalEditData: Partial<typeof initialEditDocumentModelState>;
  dragItem: {
    index?: number;
    dropTargetId?: string | number;
  };
  selectItem: NodeDocumentModel | null;
}

const initialState: IDocumentSlice = {
  model: null,
  needSynchronization: false,
  dragItem: {},
  selectItem: null,
  modalEditData: {},
};

const name = 'document';

export const documentSlice = createSlice({
  name,
  initialState,
  reducers: {
    setSaveDocument: (state) => {
      state.needSynchronization = false;
    },
    setDocumentModalEditData: (
      state,
      action: PayloadAction<IDocumentSlice['modalEditData']>,
    ) => {
      state.modalEditData = action.payload;
    },
    setDocumentModel: (
      state,
      action: PayloadAction<IDocumentSlice['model']>,
    ) => {
      state.model = action.payload;
      state.dragItem = {};
      state.selectItem = null;
    },
    setDocumentModelSections: (
      state,
      action: PayloadAction<IDocumentModelData['sections']>,
    ) => {
      if (state.model) state.model.sections = action.payload;
    },
    setDocumentDragItem: (
      state,
      action: PayloadAction<IDocumentSlice['dragItem']>,
    ) => {
      state.dragItem = action.payload;
    },
    setDocumentSelectItem: (
      state,
      action: PayloadAction<NodeDocumentModel | null>,
    ) => {
      state.selectItem = action.payload;
    },
  },
});

export const TreeName = name;

export const {
  setDocumentDragItem,
  setDocumentModel,
  setDocumentSelectItem,
  setSaveDocument,
  setDocumentModalEditData,
  setDocumentModelSections,
} = documentSlice.actions;

export const selectAllDocumentModel = (state: AppState) => state[name].model;

export const selectEqualDocumentDragItem =
  (id: string | number) => (state: AppState) =>
    state[name].dragItem.dropTargetId == id;

export const selectEqualDocumentSelectItem =
  (id: string | number) => (state: AppState) =>
    state[name].selectItem?.id == id;

export const selectEqualDocumentDragItemIndex =
  (index?: number) => (state: AppState) =>
    state[name].dragItem.index === index;

export const selectDocumentDragItem = (state: AppState) => state[name].dragItem;
export const selectDocumentSelectItem = (state: AppState) =>
  state[name].selectItem;

export default documentSlice.reducer;
