/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';

interface IDebounce {
  onDebounce: (...args: any[]) => any;
  onClearDebounce: () => void;
}

export const useDebounce = (
  fn: (...args: any[]) => any,
  delay: number,
  continueUnmounted?: boolean, // if want to continue to update after unmounted
): IDebounce => {
  const ref = useRef<number | undefined | null>(null);

  useEffect(() => {
    return () => {
      if (ref.current && !continueUnmounted) window.clearTimeout(ref.current);
    };
  });

  async function onDebounce(...args: any[]): Promise<void> {
    if (ref.current) {
      await window.clearTimeout(ref.current);
    }

    const timeout = await window.setTimeout(() => {
      fn(...args);
    }, delay);
    ref.current = timeout;
  }

  function onClearDebounce(): void {
    if (ref.current) window.clearTimeout(ref.current);
  }

  return { onDebounce, onClearDebounce };
};
