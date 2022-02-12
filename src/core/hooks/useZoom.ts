/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from 'react';

import { useControlClick } from './useControlClick';

export const useZoom = (containerRef: React.RefObject<HTMLDivElement>) => {
  const wheelSumValue = useRef<number>(0);

  const { controlKeyPress } = useControlClick();

  const eventListener = useCallback(
    (event: WheelEvent) => {
      if (containerRef.current && controlKeyPress.current) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        const wheelNewValue = wheelSumValue.current + event.deltaY;
        const maxWheel = wheelNewValue > 10000 ? 10000 : wheelNewValue;

        wheelSumValue.current = wheelNewValue < 0 ? 0 : maxWheel;

        const scale = 1 * (1 - (1 * wheelSumValue.current) / 10000);
        const actualScale = scale > 0.2 ? scale : 0.2;

        const translate = `translate(-${
          Math.ceil(((100 - 100 * actualScale) / 2) * 100) / (100 * actualScale)
        }%, -${
          Math.ceil(((100 - 100 * actualScale) / 2) * 100) / (100 * actualScale)
        }%)`;

        containerRef.current.style.transform = `scale(${actualScale}) ${translate}`;
        containerRef.current.style.width = `${100 / actualScale}%`;
        containerRef.current.style.height = `${100 / actualScale}%`;
      }
    },
    [containerRef, controlKeyPress],
  );

  useEffect(() => {
    window.addEventListener('wheel', eventListener, { passive: false });
    return () => {
      window.removeEventListener('wheel', eventListener);
    };
  }, [eventListener]);
};
