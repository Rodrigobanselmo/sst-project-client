// import { Reducer } from '@reduxjs/toolkit';

import hierarchyReducer from './hierarchy/hierarchySlice';
import modalReducer from './modal/modalSlice';
import routeLoadingReducer from './routeLoad/routeLoadSlice';
import saveReducer from './save/saveSlice';
import sidebarReducer from './sidebar/sidebarSlice';
import treeReducer from './tree/treeSlice';
import userReducer from './user/userSlice';

export const rootReducer = {
  sidebar: sidebarReducer,
  routeLoad: routeLoadingReducer,
  user: userReducer,
  save: saveReducer,
  tree: treeReducer,
  modal: modalReducer,
  hierarchy: hierarchyReducer,
};
