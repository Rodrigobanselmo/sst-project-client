import { useCallback, useEffect, useState } from 'react';

export const MIN_TREE_SCALE = 0.2;
const MAX_TREE_SCALE = 1;

const clampScale = (scale: number) =>
  Math.min(MAX_TREE_SCALE, Math.max(MIN_TREE_SCALE, scale));

export const useZoom = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  { wheelZoom = true }: { wheelZoom?: boolean } = {},
) => {
  const [scale, setScale] = useState(MAX_TREE_SCALE);

  const onChangeZoom = useCallback((value: number) => {
    setScale(clampScale(value));
  }, []);

  useEffect(() => {
    if (!wheelZoom) return;

    const onWheel = (event: WheelEvent) => {
      const container = containerRef.current;
      if (
        !container ||
        !(event.target instanceof Node) ||
        !container.contains(event.target) ||
        !(event.ctrlKey || event.metaKey)
      ) {
        return;
      }

      event.preventDefault();
      setScale((current) => clampScale(current - event.deltaY / 10000));
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [containerRef, wheelZoom]);

  const offset = Math.ceil((1 - scale) * 5000) / (100 * scale);
  const zoomStyle = scale === MAX_TREE_SCALE
    ? undefined
    : {
        transform: `scale(${scale}) translate(-${offset}%, -${offset}%)`,
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
      };

  return { onChangeZoom, scale, zoomStyle };
};
