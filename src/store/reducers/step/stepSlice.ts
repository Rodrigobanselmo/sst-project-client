/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CompanyStepEnum } from 'project/enum/company-step.enum';

import { AppState } from '../..';

interface IStepDocument {
  companyStep?: CompanyStepEnum;
}

interface IPayload {
  companyId: string;
  step: CompanyStepEnum;
}

const initialState: Record<string, IStepDocument> = {};

const name = 'step';

export const stepSlice = createSlice({
  name,
  initialState,
  reducers: {
    setCompanyStep: (state, action: PayloadAction<IPayload>) => {
      if (!state[action.payload.companyId]) {
        state[action.payload.companyId] = {};
      }
      state[action.payload.companyId].companyStep = action.payload.step;
    },
  },
});

export const StepName = name;

export const { setCompanyStep } = stepSlice.actions;

export const selectStep = (companyId: string) => (state: AppState) =>
  state[name][companyId];

export default stepSlice.reducer;
