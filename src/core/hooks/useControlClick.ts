import { useRef } from 'react';

import { useKeypress } from './useKeypress';

export const useControlClick = (
  key?: string,
  callback?: (e: KeyboardEvent) => void,
) => {
  const controlKeyPress = useRef<boolean>(false);

  useKeypress(
    ['Control', 'Meta'],
    (e) => {
      e.preventDefault();
      controlKeyPress.current = true;
    },
    'keydown',
  );

  useKeypress(
    ['Control', 'Meta'],
    (e) => {
      e.preventDefault();
      controlKeyPress.current = false;
    },
    'keyup',
  );

  useKeypress(
    key,
    (e) => {
      if (controlKeyPress.current && callback) {
        e.preventDefault();
        callback(e);
      }
    },
    'keydown',
  );

  return { controlKeyPress };
};
