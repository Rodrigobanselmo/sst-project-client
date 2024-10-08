/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ViewsDataEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-data-type.constant';
import { ViewTypeEnum } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/view-risk-type.constant';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { AppState } from '../..';

export interface IRiskAddState {
  init: boolean;
  expanded: boolean;
  risk: IRiskFactors | null;
  risks: IRiskFactors[];
  viewType: ViewTypeEnum;
  viewData: ViewsDataEnum;
  isSaving: boolean;
  isEdited: boolean;
}

const initialState: IRiskAddState = {
  init: false,
  expanded: true,
  viewType: ViewTypeEnum.SIMPLE_BY_GROUP,
  viewData: ViewsDataEnum.HIERARCHY,
  risk: null,
  risks: [],
  isSaving: false,
  isEdited: false,
};

const name = 'riskAdd';

export const riskAddSlice = createSlice({
  name,
  initialState,
  reducers: {
    setRiskAddState: (state, action: PayloadAction<Partial<IRiskAddState>>) => {
      return { ...state, ...action.payload };
    },
    setRiskAddInit: (state, action: PayloadAction<boolean | undefined>) => {
      if (action.payload === undefined) state.init = !state.init;
      else state.init = action.payload;
    },
    setRiskAddToggleExpand: (
      state,
      action: PayloadAction<boolean | undefined>,
    ) => {
      if (action.payload === undefined) state.expanded = !state.expanded;
      else state.expanded = action.payload;
    },
  },
});

export const SaveName = name;

export const { setRiskAddState, setRiskAddInit, setRiskAddToggleExpand } =
  riskAddSlice.actions;

export const selectRiskAddInit = (state: AppState) => state.riskAdd.init;
export const selectRisk = (state: AppState) => state.riskAdd.risk;
export const selectRisks = (state: AppState) => state.riskAdd.risks;
export const selectRiskAddExpand = (state: AppState) => state.riskAdd.expanded;
export const selectRiskDataSave = (state: AppState) => ({
  isSaving: state.riskAdd.isSaving,
  isEdited: state.riskAdd.isEdited,
});

export default riskAddSlice.reducer;
