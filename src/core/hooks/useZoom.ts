/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';

import { useDebouncedCallback } from 'use-debounce';

import { useControlClick } from './useControlClick';

export const useZoom = (containerRef: React.RefObject<HTMLDivElement>) => {
  const wheelSumValue = useRef<number>(0);

  const { controlKeyPress } = useControlClick();
  const [scale, setScale] = useState(1);

  const debounceChangeScale = useDebouncedCallback((value: number) => {
    setScale(value);
  }, 1000);

  const onChangeZoom = useCallback(
    (scale: number) => {
      if (containerRef.current) {
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
    [containerRef],
  );

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

        onChangeZoom(scale);
        // debounceChangeScale(scale);
      }
    },
    [containerRef, controlKeyPress, onChangeZoom],
  );

  useEffect(() => {
    window.addEventListener('wheel', eventListener, { passive: false });
    return () => {
      window.removeEventListener('wheel', eventListener);
    };
  }, [eventListener]);

  const onGetScale = (value: number, max: number, min: number) => {
    if (value > max) return 1;
    if (value < min) return 0.2;
    return (value - min) / (max - min);
  };

  return { onChangeZoom, onGetScale, scale };
};
