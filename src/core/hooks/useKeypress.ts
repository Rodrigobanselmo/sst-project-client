/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';

export const useKeypress = (
  keys: string[] | string | undefined,
  handler: (event: KeyboardEvent) => any,
  windowEvent: 'keydown' | 'keypress' | 'keyup' = 'keydown',
) => {
  const eventListenerRef = useRef<(event: KeyboardEvent) => void>(() => null);

  useEffect(() => {
    if (keys) {
      eventListenerRef.current = (event: KeyboardEvent) => {
        if (
          Array.isArray(keys) ? keys.includes(event.key) : keys === event.key
        ) {
          handler?.(event);
        }
      };
    }
  }, [keys, handler]);

  useEffect(() => {
    if (keys) {
      const eventListener = (event: KeyboardEvent) => {
        eventListenerRef.current(event);
      };
      window.addEventListener(windowEvent, eventListener);
      return () => {
        window.removeEventListener(windowEvent, eventListener);
      };
    }
  }, [windowEvent]);
};
