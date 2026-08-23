import React, { useEffect, useRef, useState } from 'react';

import { Box } from '@mui/material';

import {
  A4_LANDSCAPE_MM,
  DocumentEditorV2ViewMode,
} from './document-editor-v2-page-layout';
import { documentEditorV2PageDeskSx } from './document-editor-v2-page-layout-sx';

const CSS_PX_PER_MM = 96 / 25.4;

export function DocumentEditorV2PageDesk({
  viewMode,
  children,
}: {
  viewMode: DocumentEditorV2ViewMode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (viewMode !== 'page') {
      setScale(1);
      return undefined;
    }
    const node = ref.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;

    const measure = () => {
      const available = node.clientWidth - 24;
      const landscapePx = A4_LANDSCAPE_MM.width * CSS_PX_PER_MM;
      setScale(Math.min(1, available / landscapePx));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [viewMode]);

  if (viewMode !== 'page') return <>{children}</>;

  return (
    <Box
      ref={ref}
      className="doc-editor-v2-page-desk"
      sx={documentEditorV2PageDeskSx}
    >
      <Box
        sx={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          width: scale < 1 ? `${100 / scale}%` : '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
