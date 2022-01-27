// import { Reducer } from '@reduxjs/toolkit';

import exampleReducer from './example/exampleSlice';
import sidebarReducer from './sidebar/sidebarSlice';

export const rootReducer = {
  example: exampleReducer,
  sidebar: sidebarReducer,
};
