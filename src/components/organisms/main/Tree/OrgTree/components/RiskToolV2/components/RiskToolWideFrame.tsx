import React, { useEffect } from 'react';

import { Box } from '@mui/material';

import { STBoxContainer } from '../RiskTool.styles';
import { useRiskToolWideViewOptional } from './RiskToolWideViewContext';

/**
 * Wrapper visual do RiskTool. Em modo amplo usa position:fixed (z-index abaixo
 * dos Modals MUI ~1300) sem remount — preserva estado e popovers/portals.
 */
export function RiskToolWideFrame({
  children,
  selectExpanded,
}: {
  children: React.ReactNode;
  selectExpanded?: boolean;
}) {
  const wideCtx = useRiskToolWideViewOptional();
  const wideView = !!wideCtx?.wideView;

  useEffect(() => {
    if (!wideView || !wideCtx) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // Não roubar Esc de Dialog/Popover/Menu abertos (EPI, fonte, etc.).
      if (
        document.querySelector(
          '.MuiModal-root, .MuiPopover-root, .MuiMenu-root, .MuiAutocomplete-popper',
        )
      ) {
        return;
      }
      wideCtx.setWideView(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [wideCtx, wideView]);

  return (
    <>
      {wideView && (
        <Box
          aria-hidden
          onClick={() => wideCtx?.setWideView(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1190,
            bgcolor: 'rgba(15, 23, 42, 0.35)',
          }}
        />
      )}
      <STBoxContainer
        expanded={selectExpanded ? 1 : 0}
        risk_init={1}
        open={1}
        data-risktool-wide={wideView ? '1' : '0'}
        sx={
          wideView
            ? {
                position: 'fixed',
                inset: { xs: 8, md: 16 },
                zIndex: 1200,
                m: 0,
                maxHeight: 'none',
                height: 'auto',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: 8,
              }
            : undefined
        }
      >
        {children}
      </STBoxContainer>
    </>
  );
}
