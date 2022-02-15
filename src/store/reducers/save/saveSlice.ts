/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';

interface ISavedDocument {
  docName: string;
  persist?: boolean;
  message?: string;
  href?: string;
}

const initialState: ISavedDocument[] = [];

const name = 'save';

export const saveSlice = createSlice({
  name,
  initialState,
  reducers: {
    setDocUnsaved: (state, action: PayloadAction<ISavedDocument>) => {
      return [
        ...state.filter((i) => i.docName !== action.payload.docName),
        action.payload,
      ];
    },
    setDocSaved: (state, action: PayloadAction<ISavedDocument>) => {
      return [...state.filter((i) => i.docName !== action.payload.docName)];
    },
  },
});

export const SaveName = name;

export const { setDocUnsaved, setDocSaved } = saveSlice.actions;

export const selectSave = (docName: string) => (state: AppState) =>
  state[name].find((a) => a.docName === docName);

export const selectAllSave = (state: AppState) => state[name];

export default saveSlice.reducer;
