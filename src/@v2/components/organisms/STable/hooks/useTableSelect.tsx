import { create } from 'zustand';

export enum TablesSelectEnum {
  CHARACTERIZATION = 'CHARACTERIZATION',
  ACTION_PLAN = 'ACTION_PLAN',
  COMMENTS = 'COMMENTS',
  DOCUMENT_CONTROL = 'DOCUMENT_CONTROL',
  TASK = 'TASK',
  TASK_SUB = 'TASK_SUB',
  TASK_ACTION_PLAN = 'TASK_ACTION_PLAN',
  TASK_SUB_ACTION_PLAN = 'TASK_SUB_ACTION_PLAN',
}

interface SelectState {
  ids: Record<string, Set<string>>;
  versions: Record<string, number>;
  has: (key: TablesSelectEnum) => (item: string | string[]) => boolean;
  getIds: (key: TablesSelectEnum) => () => string[];
  select: (key: TablesSelectEnum) => (item: string) => void;
  remove: (key: TablesSelectEnum) => (item: string | string[]) => void;
  clear: (key: TablesSelectEnum) => () => void;
  add: (key: TablesSelectEnum) => (item: string | string[]) => void;
}

export const useTableSelect = create<SelectState>((set) => ({
  ids: {},
  versions: {},

  getIds: (key) => () => {
    const set = useTableSelect.getState().ids[key];
    if (!set) return [];

    return Array.from(set);
  },

  has: (key) => (item) => {
    const set = useTableSelect.getState().ids[key];
    if (!set) return false;
    if (Array.isArray(item)) {
      return item.every((i) => set.has(i));
    }
    return set.has(item);
  },

  select: (key) => (item) =>
    set((state) => {
      if (!state.ids[key]) {
        state.ids[key] = new Set();
      }

      const ids = state.ids[key];
      if (ids.has(item)) {
        ids.delete(item);
      } else {
        ids.add(item);
      }
      return {
        versions: { ...state.versions, [key]: (state.versions[key] || 0) + 1 },
      };
    }),

  remove: (key) => (item) =>
    set((state) => {
      const ids = state.ids[key];
      if (!ids) return {};
      if (Array.isArray(item)) {
        item.forEach((i) => ids.delete(i));
      } else {
        ids.delete(item);
      }
      return {
        versions: { ...state.versions, [key]: (state.versions[key] || 0) + 1 },
      };
    }),

  add: (key) => (item) =>
    set((state) => {
      if (!state.ids[key]) {
        state.ids[key] = new Set();
      }
      const ids = state.ids[key];
      if (Array.isArray(item)) {
        item.forEach((i) => ids.add(i));
      } else {
        ids.add(item);
      }
      return {
        versions: { ...state.versions, [key]: (state.versions[key] || 0) + 1 },
      };
    }),

  clear: (key) => () =>
    set((state) => {
      if (state.ids[key]) {
        state.ids[key].clear();
      }
      return {
        versions: { ...state.versions, [key]: (state.versions[key] || 0) + 1 },
      };
    }),
}));
