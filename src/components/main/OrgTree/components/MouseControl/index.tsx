import React, { useState, useRef, FC } from 'react';

import { useKeypress } from '../../../../../core/hooks/useKeypress';
import { STMouseControlBox } from './styles';

export const MouseControl: FC<{
  orgContainerRef: React.RefObject<HTMLDivElement>;
}> = ({ orgContainerRef }) => {
  const [controlKeyPress, setControlKeyPress] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const xDragging = useRef<number>(0);
  const yDragging = useRef<number>(0);

  useKeypress(
    ' ',
    (e) => {
      e.preventDefault();
      setControlKeyPress(true);
    },
    'keydown',
  );

  useKeypress(
    ' ',
    (e) => {
      e.preventDefault();
      setControlKeyPress(false);
    },
    'keyup',
  );

  return (
    <STMouseControlBox
      ref={containerRef}
      onMouseMove={(e) => {
        if (isDragging.current) {
          if (orgContainerRef.current) {
            const diffX = e.pageX - xDragging.current;
            const diffY = e.pageY - yDragging.current;
            orgContainerRef.current.scrollLeft =
              orgContainerRef.current.scrollLeft - diffX;
            orgContainerRef.current.scrollTop =
              orgContainerRef.current.scrollTop - diffY;
          }

          xDragging.current = e.pageX;
          yDragging.current = e.pageY;
        }
      }}
      onMouseDown={(e) => {
        isDragging.current = true;
        xDragging.current = e.pageX;
        yDragging.current = e.pageY;

        if (containerRef.current)
          containerRef.current.style.cursor = 'grabbing';
      }}
      onMouseUp={() => {
        isDragging.current = false;

        if (containerRef.current) containerRef.current.style.cursor = 'grab';
      }}
      sx={{ cursor: 'grab' }}
      display={controlKeyPress ? 'flex' : 'none'}
    />
  );
};
