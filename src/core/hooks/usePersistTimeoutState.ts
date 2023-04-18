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
      storageValue != '{}' &&
      (!timestamp || Date.now() - Number(timestamp) < timeout)
    ) {
      return JSON.parse(storageValue);
    }

    return initialState;
  });

  useEffect(() => {
    const event = localStorage.getItem(`${key}_event`);

    const clearCache = () => {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
      localStorage.removeItem(`${key}_event`);
    };

    if (!event) {
      localStorage.setItem(`${key}_event`, 'true');
      window.addEventListener('beforeunload', clearCache);
    }
  }, [key]);

  useEffect(() => {
    if (timeout) {
      localStorage.setItem(key, JSON.stringify(state));
      localStorage.setItem(`${key}_timestamp`, String(Date.now()));
    }
  }, [state, timeout, key]);

  return [state, setState];
}
