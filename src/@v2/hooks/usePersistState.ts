import { useState, useEffect, Dispatch, SetStateAction } from 'react';

export enum persistKeys {
  COLUMNS_CHARACTERIZATION = 'COLUMNS_CHARACTERIZATION',
  COLUMNS_ACTION_PLAN = 'COLUMNS_ACTION_PLAN',
  COLUMNS_DOCUMENT_CONTROL = 'COLUMNS_DOCUMENT_CONTROL',

  COLUMNS_FORMS_APPLICATION = 'COLUMNS_FORMS_APPLICATION',
  COLUMNS_FORMS_MODEL = 'COLUMNS_FORMS_MODEL',

  COLUMNS_TASK_ACTION_PLAN = 'COLUMNS_TASK_ACTION_PLAN',
  COLUMNS_TASK_SUB_ACTION_PLAN = 'COLUMNS_TASK_SUB_ACTION_PLAN',
  COLUMNS_TASK_SUB = 'COLUMNS_TASK_SUB',
  COLUMNS_TASK = 'COLUMNS_TASK',
}

type Response<T> = [T, Dispatch<SetStateAction<T>>];

export function usePersistedState<T>(
  key: string,
  initialState: T,
): Response<T> {
  const [state, setState] = useState(() => {
    const storageValue = localStorage.getItem(key);

    if (storageValue) {
      return JSON.parse(storageValue);
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}
