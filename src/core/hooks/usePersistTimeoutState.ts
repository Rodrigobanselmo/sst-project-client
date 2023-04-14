import { useState, useEffect, Dispatch, SetStateAction } from 'react';

type Response<T> = [T, Dispatch<SetStateAction<T>>];

export function usePersistTimeoutState<T>(
  key: string,
  initialState: T,
  timeout?: number,
): Response<T> {
  const [state, setState] = useState(() => {
    const storageValue = timeout ? localStorage.getItem(key) : null;
    const timestamp = timeout ? localStorage.getItem(`${key}_timestamp`) : null;

    if (
      timeout &&
      storageValue &&
      (!timestamp || Date.now() - Number(timestamp) < timeout)
    ) {
      return JSON.parse(storageValue);
    }

    return initialState;
  });

  useEffect(() => {
    if (timeout) {
      localStorage.setItem(key, JSON.stringify(state));
      localStorage.setItem(`${key}_timestamp`, String(Date.now()));
    }
  }, [state, timeout, key]);

  return [state, setState];
}
