/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useEffect, useRef } from 'react';

interface IReturn {
  onDebounce: (fn: () => void, delay: number) => Promise<void>;
  onClearDebounce: () => void;
}

export const useNewDebounce = (): IReturn => {
  const ref = useRef<number | undefined | null>(null);

  useEffect(() => {
    return () => {
      if (ref.current) window.clearTimeout(ref.current);
    };
  });

  async function onDebounce(fn: () => void, delay: number): Promise<void> {
    if (ref.current) {
      await window.clearTimeout(ref.current);
    }

    const timeout = await window.setTimeout(() => {
      fn();
    }, delay);
    ref.current = timeout;
  }

  function onClearDebounce(): void {
    if (ref.current) window.clearTimeout(ref.current);
  }

  return { onDebounce, onClearDebounce };
};
