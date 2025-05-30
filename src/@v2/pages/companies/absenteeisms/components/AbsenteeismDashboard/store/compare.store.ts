import { ReactNode } from 'react';
import { create } from 'zustand';

export interface GraphData {
  value: number;
  label: string;
}

interface SelectState {
  graph1: GraphData[];
  graph2: GraphData[];
  graph3: GraphData[];
  setGraph1: (data: GraphData[]) => void;
  setGraph2: (data: GraphData[]) => void;
  setGraph3: (data: GraphData[]) => void;
}

export const useCompareState = create<SelectState>((set) => ({
  graph1: [],
  graph2: [],
  graph3: [],
  setGraph1: (data) => set({ graph1: data }),
  setGraph2: (data) => set({ graph2: data }),
  setGraph3: (data) => set({ graph3: data }),
}));
