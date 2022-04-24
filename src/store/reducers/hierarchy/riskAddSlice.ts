/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { AppState } from '../..';

export interface IDataAddRisk {
  gs?: {
    id: string;
    name: string;
  }[];
  probability?: number;
  epi?: string[];
  med?: {
    id: string;
    name: string;
  }[];
  rec?: {
    id: string;
    name: string;
  }[];
  adm?: {
    id: string;
    name: string;
  }[];
}

export interface IRiskAddState {
  init: boolean;
  expanded: boolean;
  risk: IRiskFactors | null;
  gho: Record<string, Record<string, IDataAddRisk>>;
  hierarchy: Record<string, Record<string, IDataAddRisk>>;
}

const initialState: IRiskAddState = {
  init: false,
  expanded: false,
  risk: null,
  gho: {},
  hierarchy: {},
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
    setGhoRisk: (
      state,
      action: PayloadAction<{
        ghoId: string;
        riskId: number;
        data: IDataAddRisk;
      }>,
    ) => {
      if (!state.gho[action.payload.ghoId])
        state.gho[action.payload.ghoId] = {};

      if (!state.gho[action.payload.ghoId][action.payload.riskId])
        state.gho[action.payload.ghoId][action.payload.riskId] = {};

      state.gho[action.payload.ghoId][action.payload.riskId] = {
        ...state.gho[action.payload.ghoId][action.payload.riskId],
        ...action.payload.data,
      };
    },
    setGhoRiskAddParams: (
      state,
      action: PayloadAction<{
        ghoId: string;
        riskId: string;
        data: IDataAddRisk;
      }>,
    ) => {
      if (!state.gho[action.payload.ghoId])
        state.gho[action.payload.ghoId] = {};

      if (!state.gho[action.payload.ghoId][action.payload.riskId])
        state.gho[action.payload.ghoId][action.payload.riskId] = {};

      Object.entries(action.payload.data).map(([k, value]) => {
        const key = k as keyof IDataAddRisk;

        if (Array.isArray(value)) {
          const data =
            (state.gho[action.payload.ghoId][action.payload.riskId][
              key
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ] as Array<any>) || [];

          if (!data)
            state.gho[action.payload.ghoId][action.payload.riskId][key] =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              [] as any;

          (state.gho[action.payload.ghoId][action.payload.riskId][
            key
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ] as any[]) = removeDuplicate([...value, ...data], {
            removeById: 'id',
          });
        } else {
          state.gho[action.payload.ghoId][action.payload.riskId][key] = value;
        }
      });
    },
    setGhoRiskRemoveParams: (
      state,
      action: PayloadAction<{
        ghoId: string;
        riskId: string;
        data: IDataAddRisk;
      }>,
    ) => {
      if (!state.gho[action.payload.ghoId])
        state.gho[action.payload.ghoId] = {};

      if (!state.gho[action.payload.ghoId][action.payload.riskId])
        state.gho[action.payload.ghoId][action.payload.riskId] = {};

      Object.entries(action.payload.data).map(([k, value]) => {
        const key = k as keyof IDataAddRisk;

        if (Array.isArray(value)) {
          const data =
            (state.gho[action.payload.ghoId][action.payload.riskId][
              key
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ] as Array<any>) || [];

          if (!data)
            state.gho[action.payload.ghoId][action.payload.riskId][key] =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              [] as any;

          (state.gho[action.payload.ghoId][action.payload.riskId][
            key
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ] as any[]) = [...data].filter(
            (data) => !value.some((v) => v.id === data.id),
          );
        } else {
          state.gho[action.payload.ghoId][action.payload.riskId][key] = value;
        }
      });
    },
  },
});

export const SaveName = name;

export const {
  setRiskAddState,
  setRiskAddInit,
  setRiskAddToggleExpand,
  setGhoRiskAddParams,
  setGhoRisk,
  setGhoRiskRemoveParams,
} = riskAddSlice.actions;

export const selectRiskAddInit = (state: AppState) => state.riskAdd.init;
export const selectRisk = (state: AppState) => state.riskAdd.risk;
export const selectRiskAddExpand = (state: AppState) => state.riskAdd.expanded;
export const selectGhoRiskData =
  (ghoId: string, riskId: string) => (state: AppState) =>
    (state.riskAdd.gho[ghoId]
      ? state.riskAdd.gho[ghoId][riskId] || {}
      : {}) as IDataAddRisk;

export default riskAddSlice.reducer;
