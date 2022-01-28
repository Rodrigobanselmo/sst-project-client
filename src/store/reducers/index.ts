// import { Reducer } from '@reduxjs/toolkit';

import exampleReducer from './example/exampleSlice';
import routeLoadingReducer from './routeLoad/routeLoadSlice';
import sidebarReducer from './sidebar/sidebarSlice';

export const rootReducer = {
  example: exampleReducer,
  sidebar: sidebarReducer,
  routeLoad: routeLoadingReducer,
};
