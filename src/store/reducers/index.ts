// import { Reducer } from '@reduxjs/toolkit';

import ghoMultiReducer from './hierarchy/ghoMultiSlice';
import ghoReducer from './hierarchy/ghoSlice';
import hierarchyReducer from './hierarchy/hierarchySlice';
import riskAddReducer from './hierarchy/riskAddSlice';
import modalReducer from './modal/modalSlice';
import routeLoadingReducer from './routeLoad/routeLoadSlice';
import saveReducer from './save/saveSlice';
import sidebarReducer from './sidebar/sidebarSlice';
import treeReducer from './tree/treeSlice';
import userReducer from './user/userSlice';

export const rootReducer = {
  sidebar: sidebarReducer,
  riskAdd: riskAddReducer,
  routeLoad: routeLoadingReducer,
  user: userReducer,
  save: saveReducer,
  tree: treeReducer,
  gho: ghoReducer,
  modal: modalReducer,
  hierarchy: hierarchyReducer,
  ghoMulti: ghoMultiReducer,
};
