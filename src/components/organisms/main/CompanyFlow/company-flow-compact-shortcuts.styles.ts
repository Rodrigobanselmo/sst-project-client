import { SxProps, Theme } from '@mui/material';
import {
  brandIdentityFillHoverSx,
  brandIdentityFillSx,
  brandIdentityOutlinedHoverDarkSx,
  brandIdentityOutlinedHoverLightSx,
  brandIdentityOutlinedInteractPaint,
  BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
} from 'configs/theme/brand-identity-fill';

/** Espaçamento horizontal entre atalhos (theme spacing). */
export const COMPANY_FLOW_COMPACT_SHORTCUTS_FLEX_GAP = 2.5;

/** Mesmo gap dos grids de cards da home (`homeCardsGridSx` / `launchCardsGridSx`). */
export const COMPANY_HOME_CARDS_GRID_GAP = 10;

/** Container compacto com borda discreta (Programas e Laudos, Gestão da Empresa, etc.). */
export const companyFlowCompactPanelSx: SxProps<Theme> = {
  p: 1.25,
  pt: 1,
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'transparent',
  position: 'relative',
  zIndex: 1,
};

/** Botão/atalho compacto com ícone ao lado do texto. */
export const companyFlowCompactShortcutButtonSx: SxProps<Theme> = {
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 1.75,
  py: 1.05,
  px: 1.35,
  minWidth: 'unset',
  maxWidth: '100%',
  border: '1px solid',
  ...brandIdentityFillSx,
  borderRadius: 1,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
  '&&': {
    ...brandIdentityFillSx,
    boxShadow: (theme) =>
      theme.palette.mode === 'light'
        ? '0 1px 2px rgba(0, 0, 0, 0.06)'
        : '0 1px 2px rgba(0, 0, 0, 0.2)',
  },
  '&:hover': {
    filter: 'none',
    '&&': {
      ...brandIdentityFillHoverSx,
      boxShadow: (theme) =>
        theme.palette.mode === 'light'
          ? '0 1px 3px rgba(0, 0, 0, 0.1)'
          : '0 2px 4px rgba(0, 0, 0, 0.25)',
    },
  },
  '&:active': {
    filter: 'none',
  },
  '&& .MuiIcon-root, && svg': {
    fontSize: 20,
    flexShrink: 0,
    color: 'primary.identityOn',
  },
  '&& p': {
    fontSize: 13,
    lineHeight: 1.3,
    textAlign: 'left',
    whiteSpace: 'normal',
    color: 'primary.identityOn',
  },
};

/**
 * Ação secundária do workspace (Dados da Empresa / Programas e Laudos).
 * Repouso neutro em pílula; identidade só em hover / focus-visible / pressed.
 */
const workspaceIdentityOn = {
  color: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? 'primary.main' : 'primary.identityOn',
} as const;

const workspaceActionInteractPaint = {
  filter: 'none',
  boxShadow: 'none',
  ...brandIdentityOutlinedInteractPaint,
  '& p': workspaceIdentityOn,
} as const;

export const companyWorkspaceActionButtonSx: SxProps<Theme> = {
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 2,
  py: 0.75,
  px: 1.85,
  minHeight: BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
  minWidth: 'unset',
  maxWidth: '100%',
  border: '1px solid',
  borderRadius: 3,
  cursor: 'pointer',
  boxShadow: 'none',
  transition:
    'background-color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, color 0.15s ease',
  '&&': {
    backgroundColor: 'transparent',
    color: 'text.primary',
    borderColor: 'grey.600',
    boxShadow: 'none',
    py: 0.75,
    px: 1.85,
    minHeight: BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
    borderRadius: 3,
  },
  '&&:hover': workspaceActionInteractPaint,
  '&&:focus-visible': workspaceActionInteractPaint,
  '&&:active': workspaceActionInteractPaint,
  '&& .MuiIcon-root, && svg': {
    fontSize: 22,
    flexShrink: 0,
    color: 'grey.600',
  },
  '&& p': {
    fontSize: 13.5,
    fontWeight: 500,
    lineHeight: 1.35,
    textAlign: 'left',
    whiteSpace: 'normal',
    color: 'text.primary',
  },
};

/**
 * Importar Planilha / Baixar Relatórios: utilitários persistentes.
 * Repouso outlined/discreto (família Colunas/Filtrar); identidade só no hover.
 */
export const principalBrandButtonSx: SxProps<Theme> = (theme) => {
  const hover = (theme.palette.mode === 'dark'
    ? brandIdentityOutlinedHoverDarkSx
    : brandIdentityOutlinedHoverLightSx)['&:hover'];

  return {
    height: BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
    minHeight: BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
    borderRadius: 3,
    px: 4,
    minWidth: 'auto',
    textTransform: 'none',
    boxShadow: 'none',
    '&&': {
      backgroundColor: 'transparent',
      color: 'text.primary',
      borderColor: 'grey.600',
    },
    '&&:hover': {
      ...hover,
      boxShadow: 'none',
    },
    '&&:focus-visible': {
      ...hover,
      boxShadow: 'none',
    },
    '&&:active': {
      ...hover,
      boxShadow: 'none',
    },
  };
};
