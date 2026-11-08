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
    y: Math.max(
      Math.min(100, Math.max(8, viewportHeight - height - 8)),
      Math.min(y, viewportHeight - height - 8),
    ),
  };
}
/** Opening/reset placement only. Manual dragging keeps its existing viewport bounds. */
export function initialGsePanelPosition(
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
  usefulTop = 80,
) {
  const top = Math.max(8, usefulTop);
  return {
    x: clampPanelPosition(
      viewportWidth - width - 24,
      top,
      width,
      height,
      viewportWidth,
      viewportHeight,
    ).x,
    y: top,
  };
}
export function gsePanelMaxHeight(viewportHeight: number, usefulTop = 80) {
  return Math.max(32, viewportHeight - Math.max(8, usefulTop) - 96);
}
function usefulOrganogramTop(panel: HTMLElement | null) {
  const root = panel?.closest('[data-gse-organogram-viewport]');
  return Math.max(80, (root?.getBoundingClientRect().top ?? 72) + 8);
}
/** Owns position only. The panel content manages its own state. */
export function OrgFloatingPanel({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [defaultTop, setDefaultTop] = useState(80);
  const manualPosition = useRef(false);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  useEffect(() => {
    const resize = () => {
      const r = ref.current?.getBoundingClientRect();
      if (r) {
        const top = usefulOrganogramTop(ref.current);
        setDefaultTop(top);
        setPosition((p) => {
          const next =
            p && manualPosition.current
              ? clampPanelPosition(
                  p.x,
                  p.y,
                  r.width,
                  r.height,
                  innerWidth,
                  innerHeight,
                )
              : initialGsePanelPosition(
                  r.width,
                  r.height,
                  innerWidth,
                  innerHeight,
                  top,
                );
          return p && p.x === next.x && p.y === next.y ? p : next;
        });
      }
    };
    resize();
    window.addEventListener('resize', resize);
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ref.current) observer?.observe(ref.current);
    return () => {
      window.removeEventListener('resize', resize);
      observer?.disconnect();
    };
  }, []);
  return (
    <Box
      id={id}
      ref={ref}
      onKeyDown={(e) => {
        if (!(e.target as HTMLElement).matches('[data-gse-drag-handle]'))
          return;
        const delta: Record<string, [number, number]> = {
          ArrowLeft: [-12, 0],
          ArrowRight: [12, 0],
          ArrowUp: [0, -12],
          ArrowDown: [0, 12],
        };
        if (!delta[e.key]) return;
        const r = e.currentTarget.getBoundingClientRect();
        const [x, y] = delta[e.key];
        manualPosition.current = true;
        setPosition(
          clampPanelPosition(
            r.left + x,
            r.top + y,
            r.width,
            r.height,
            innerWidth,
            innerHeight,
          ),
        );
        e.preventDefault();
        e.stopPropagation();
      }}
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
        manualPosition.current = true;
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
        top: position?.y ?? defaultTop,
        left: position?.x,
        right: position ? 'auto' : 24,
        width: 'min(462px, calc(100vw - 32px))',
        maxHeight: `max(32px, calc(100dvh - ${defaultTop + 96}px))`,
        display: 'flex',
        flexDirection: 'column',
        '& > div:last-child': { minHeight: 0 },
        '& [data-gse-drag-handle]': { cursor: 'grab', touchAction: 'none' },
      }}
    >
      <Button
        size="small"
        onClick={() => {
          const r = ref.current?.getBoundingClientRect();
          if (r) {
            manualPosition.current = false;
            const top = usefulOrganogramTop(ref.current);
            setDefaultTop(top);
            setPosition(
              initialGsePanelPosition(
                r.width,
                r.height,
                innerWidth,
                innerHeight,
                top,
              ),
            );
          }
        }}
        sx={{ alignSelf: 'flex-end', bgcolor: 'background.paper' }}
      >
        Restaurar posição
      </Button>
      {children}
    </Box>
  );
}

export function GseFloatingPanel({ children }: { children: React.ReactNode }) {
  return <OrgFloatingPanel id="gse-floating-panel">{children}</OrgFloatingPanel>;
}
