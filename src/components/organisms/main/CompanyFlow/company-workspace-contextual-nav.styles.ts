import type { SxProps, Theme } from '@mui/material';

/** Marcador inferior curto e centralizado (inativo transparente / ativo laranja). */
export const COMPANY_WORKSPACE_NAV_MARKER_WIDTH = 20;
export const COMPANY_WORKSPACE_NAV_MARKER_HEIGHT = 2;

/**
 * Estilos do item (label). O marcador recebe sx próprio no componente
 * para garantir width/height/background no DOM real (sem depender só de nested selector).
 */
export function getCompanyWorkspaceContextualNavItemSx(): SxProps<Theme> {
  return {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    px: 1.75,
    py: 0.5,
    minHeight: 34,
    borderRadius: 0.75,
    fontSize: 12.5,
    fontWeight: 500,
    lineHeight: 1.2,
    color: 'text.secondary',
    bgcolor: 'transparent',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    overflow: 'visible',
    borderBottom: 'none',
    transition: 'color 0.15s ease, background-color 0.15s ease',
    '& [data-nav-label]': {
      display: 'block',
      lineHeight: 1.2,
    },
    '&[data-nav-active="true"]': {
      color: 'primary.main',
      fontWeight: 700,
    },
    '&:hover': {
      color: 'primary.main',
      bgcolor: 'action.hover',
    },
    // Hover inativo: marcador cinza (não sobrescreve ativo).
    '&:hover:not([data-nav-active="true"]) [data-nav-marker]': {
      backgroundColor: 'grey.500',
      width: COMPANY_WORKSPACE_NAV_MARKER_WIDTH + 4,
    },
    '&[data-nav-active="true"]:hover': {
      color: 'primary.main',
    },
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.main',
      outlineOffset: 2,
    },
  };
}

/** Estilos do marcador no fluxo normal (position static). */
export function getCompanyWorkspaceContextualNavMarkerSx(
  isActive: boolean,
): SxProps<Theme> {
  return {
    display: 'block',
    position: 'static',
    width: COMPANY_WORKSPACE_NAV_MARKER_WIDTH,
    height: COMPANY_WORKSPACE_NAV_MARKER_HEIGHT,
    mt: 0.5,
    mx: 'auto',
    borderRadius: 999,
    flexShrink: 0,
    pointerEvents: 'none',
    backgroundColor: isActive ? 'primary.main' : 'transparent',
    transition: 'background-color 0.15s ease, width 0.15s ease',
  };
}
