import type { SxProps, Theme } from '@mui/material';

/** Marcador inferior curto e centralizado (inativo transparente). */
export const COMPANY_WORKSPACE_NAV_MARKER_WIDTH = 40;
export const COMPANY_WORKSPACE_NAV_MARKER_HEIGHT = 4;

export function resolveCompanyWorkspaceNavVisual(mode: 'light' | 'dark') {
  const isLight = mode === 'light';
  return {
    inactiveColor: isLight ? 'text.medium' : 'text.main',
    activeColor: isLight ? 'text.primary' : 'primary.onSoftBackground',
    activeFontWeight: 700,
    markerColor: isLight ? 'text.primary' : 'primary.main',
    markerWidth: COMPANY_WORKSPACE_NAV_MARKER_WIDTH,
    markerHeight: COMPANY_WORKSPACE_NAV_MARKER_HEIGHT,
  } as const;
}

/**
 * Estilos do item (label). O marcador recebe sx próprio no componente
 * para garantir width/height/background no DOM real (sem depender só de nested selector).
 */
export function getCompanyWorkspaceContextualNavItemSx(): SxProps<Theme> {
  return (theme) => {
    const visual = resolveCompanyWorkspaceNavVisual(theme.palette.mode);
    return {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      px: 2.25,
      py: 0.75,
      minHeight: 44,
      borderRadius: 0.75,
      fontSize: 15,
      fontWeight: 600,
      lineHeight: 1.2,
      color: visual.inactiveColor,
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
        color: visual.activeColor,
        fontWeight: visual.activeFontWeight,
      },
      '&:hover': {
        color: visual.activeColor,
        bgcolor: 'primary.softBackground',
      },
      '&:hover:not([data-nav-active="true"]) [data-nav-marker]': {
        backgroundColor: visual.markerColor,
        width: visual.markerWidth + 4,
      },
      '&[data-nav-active="true"]:hover': {
        color: visual.activeColor,
        bgcolor: 'primary.softBackgroundHover',
      },
      '&:focus-visible': {
        outline: '2px solid',
        outlineColor: 'primary.main',
        outlineOffset: 2,
      },
    };
  };
}

/** Estilos do marcador no fluxo normal (position static). */
export function getCompanyWorkspaceContextualNavMarkerSx(
  isActive: boolean,
): SxProps<Theme> {
  return (theme) => {
    const visual = resolveCompanyWorkspaceNavVisual(theme.palette.mode);
    return {
      display: 'block',
      position: 'static',
      width: visual.markerWidth,
      height: visual.markerHeight,
      mt: 0.5,
      mx: 'auto',
      borderRadius: 999,
      flexShrink: 0,
      pointerEvents: 'none',
      backgroundColor: isActive ? visual.markerColor : 'transparent',
      transition: 'background-color 0.15s ease, width 0.15s ease',
    };
  };
}
