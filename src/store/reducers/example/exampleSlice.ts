/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState } from '../..';

interface IExampleState {
  value: number;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: IExampleState = {
  value: 0,
  status: 'idle',
};

const name = 'example';

export const exampleSlice = createSlice({
  name,
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const exampleName = name;

export const { increment, decrement, incrementByAmount } = exampleSlice.actions;

export const selectExample = (state: AppState) => state.example;

export default exampleSlice.reducer;
