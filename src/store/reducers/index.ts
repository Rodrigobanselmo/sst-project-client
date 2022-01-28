// import { Reducer } from '@reduxjs/toolkit';

import exampleReducer from './example/exampleSlice';
import routeLoadingReducer from './routeLoad/routeLoadSlice';
import sidebarReducer from './sidebar/sidebarSlice';
import userReducer from './user/userSlice';

export const rootReducer = {
  example: exampleReducer,
  sidebar: sidebarReducer,
  routeLoad: routeLoadingReducer,
  user: userReducer,
};
