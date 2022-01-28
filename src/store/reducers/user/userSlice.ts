/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';
import { IUser } from '../../../core/interfaces/IUser';

const initialState: IUser = null as unknown as IUser;

const name = 'user';

export const userSlice = createSlice({
  name,
  initialState,
  reducers: {
    createUser: (_, action: PayloadAction<IUser>) => {
      return action.payload;
    },
  },
});

export const exampleName = name;

export const { createUser } = userSlice.actions;

export const selectUser = (state: AppState) => state[name];

export default userSlice.reducer;
