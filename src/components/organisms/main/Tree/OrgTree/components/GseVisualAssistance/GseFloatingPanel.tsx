import React, { useEffect, useRef, useState } from 'react';
import { Box, Button } from '@mui/material';
export function clampPanelPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  return {
    x: Math.max(
      Math.min(80, Math.max(8, viewportWidth - width - 8)),
      Math.min(x, viewportWidth - width - 8),
    ),
    y: Math.max(100, Math.min(y, viewportHeight - height - 8)),
  };
}
/** Owns position only. Review data remains in the existing provider. */
export function GseFloatingPanel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  useEffect(() => {
    const resize = () => {
      const r = ref.current?.getBoundingClientRect();
      if (r)
        setPosition((p) =>
          p
            ? clampPanelPosition(
                p.x,
                p.y,
                r.width,
                r.height,
                innerWidth,
                innerHeight,
              )
            : null,
        );
    };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  return (
    <Box
      id="gse-floating-panel"
      ref={ref}
      onPointerDown={(e) => {
        if (
          !(e.target as HTMLElement).closest('[data-gse-drag-handle]') ||
          (e.target as HTMLElement).closest('button,input')
        )
          return;
        const r = e.currentTarget.getBoundingClientRect();
        drag.current = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
        e.currentTarget.setPointerCapture(e.pointerId);
        e.stopPropagation();
        e.preventDefault();
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const r = e.currentTarget.getBoundingClientRect();
        setPosition(
          clampPanelPosition(
            drag.current.left + e.clientX - drag.current.x,
            drag.current.top + e.clientY - drag.current.y,
            r.width,
            r.height,
            innerWidth,
            innerHeight,
          ),
        );
        e.stopPropagation();
      }}
      onPointerUp={(e) => {
        drag.current = null;
        if (e.currentTarget.hasPointerCapture(e.pointerId))
          e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onWheel={(e) => e.stopPropagation()}
      sx={{
        position: 'fixed',
        zIndex: 1200,
        top: position?.y ?? 166,
        left: position?.x,
        right: position ? 'auto' : 24,
        width: 'min(370px, calc(100vw - 96px))',
        maxHeight: 'calc(100dvh - 180px)',
        display: 'flex',
        flexDirection: 'column',
        '& > div:last-child': { minHeight: 0 },
        '& [data-gse-drag-handle]': { cursor: 'grab', touchAction: 'none' },
      }}
    >
      <Button
        size="small"
        onClick={() => setPosition(null)}
        sx={{ alignSelf: 'flex-end', bgcolor: 'background.paper' }}
      >
        Restaurar posição
      </Button>
      {children}
    </Box>
  );
}
