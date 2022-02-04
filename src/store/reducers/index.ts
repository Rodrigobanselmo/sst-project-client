// import { Reducer } from '@reduxjs/toolkit';

import modalReducer from './modal/modalSlice';
import routeLoadingReducer from './routeLoad/routeLoadSlice';
import saveReducer from './save/saveSlice';
import sidebarReducer from './sidebar/sidebarSlice';
import userReducer from './user/userSlice';

export const rootReducer = {
  sidebar: sidebarReducer,
  routeLoad: routeLoadingReducer,
  user: userReducer,
  save: saveReducer,
  modal: modalReducer,
};
