/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';
import { IUser } from '../../../core/interfaces/api/IUser';

const initialState = {
  user: null as IUser | null,
};

const name = 'user';

export const userSlice = createSlice({
  name,
  initialState,
  reducers: {
    createUser: (state, action: PayloadAction<IUser | null>) => {
      state.user = action.payload;
    },
  },
});

export const exampleName = name;

export const { createUser } = userSlice.actions;

export const selectUser = (state: AppState) => state[name].user;

export default userSlice.reducer;
