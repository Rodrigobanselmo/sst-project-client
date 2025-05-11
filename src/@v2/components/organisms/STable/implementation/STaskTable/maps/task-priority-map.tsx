import { TaskPriorityTranslation } from '@v2/models/tasks/translations/priority.translation';

type ITaskLevelMapValue = {
  label: string;
};

export const TaskPriorityMap: Record<number, ITaskLevelMapValue> = {
  [0]: {
    label: TaskPriorityTranslation[0],
  },
  [1]: {
    label: TaskPriorityTranslation[1],
  },
  [2]: {
    label: TaskPriorityTranslation[2],
  },
  [3]: {
    label: TaskPriorityTranslation[3],
  },
  [4]: {
    label: TaskPriorityTranslation[4],
  },
};

export const TaskPriorityList = Object.entries(TaskPriorityMap).map(
  ([value, { label }]) => ({
    value: Number(value),
    label,
  }),
);
