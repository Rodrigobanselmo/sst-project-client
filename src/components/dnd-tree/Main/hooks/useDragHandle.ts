import { useEffect, RefObject } from 'react';
import { DragElementWrapper, DragSourceOptions } from 'react-dnd';

export const useDragHandle = (
  containerRef: RefObject<HTMLElement>,
  handleRef: RefObject<any>,
  drag: DragElementWrapper<DragSourceOptions>,
) => {
  if (handleRef.current) {
    drag(handleRef);
  } else {
    drag(containerRef);
  }

  useEffect(() => {
    if (handleRef.current) {
      drag(handleRef);
    } else {
      drag(containerRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleRef.current]);
};
