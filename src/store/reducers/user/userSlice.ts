/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';
import { IUser } from '../../../core/interfaces/api/IUser';

const initialState = {
  user: null as Partial<IUser> | null,
};

const name = 'user';

export const userSlice = createSlice({
  name,
  initialState,
  reducers: {
    createUser: (state, action: PayloadAction<Partial<IUser> | null>) => {
      state.user = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<IUser> | null>) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const exampleName = name;

export const { createUser, updateUser } = userSlice.actions;

export const selectUser = (state: AppState) => state[name].user;

export default userSlice.reducer;
