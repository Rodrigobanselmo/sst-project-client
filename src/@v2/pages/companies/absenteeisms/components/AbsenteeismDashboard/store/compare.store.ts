import { AbsenteeismHierarchyTypeEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';
import { ReactNode } from 'react';
import { create } from 'zustand';

export interface GraphData {
  value: number;
  label: string;
}

export interface CompareData {
  id: string;
  type: AbsenteeismHierarchyTypeEnum;
}

interface SelectState {
  compareData: CompareData[];
  graph1: GraphData[];
  graph2: GraphData[];
  graph3: GraphData[];
  setGraph1: (data: GraphData[]) => void;
  setGraph2: (data: GraphData[]) => void;
  setGraph3: (data: GraphData[]) => void;
  setCompare: (params: CompareData) => void;
  clearCompare: () => void;
}

export const useCompareState = create<SelectState>((set) => ({
  compareData: [],
  graph1: [],
  graph2: [],
  graph3: [],
  setGraph1: (data) => set({ graph1: data }),
  setGraph2: (data) => set({ graph2: data }),
  setGraph3: (data) => set({ graph3: data }),
  setCompare: (params) =>
    set((state) => {
      const exists = state.compareData.some(
        (item) => item.id === params.id && item.type === params.type,
      );

      if (exists) {
        return {
          compareData: state.compareData.filter((item) => item !== params),
        };
      }
      return { compareData: [...state.compareData, params] };
    }),
  clearCompare: () => set(() => ({ compareData: [] })),
}));
