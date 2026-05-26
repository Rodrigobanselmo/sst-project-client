import { SxProps, Theme } from '@mui/material';

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
  borderColor: 'grey.400',
  borderRadius: 1,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
  '&&': {
    backgroundColor: (theme) =>
      theme.palette.mode === 'light'
        ? theme.palette.common.white
        : theme.palette.grey[800],
    boxShadow: (theme) =>
      theme.palette.mode === 'light'
        ? '0 1px 2px rgba(0, 0, 0, 0.06)'
        : '0 1px 2px rgba(0, 0, 0, 0.2)',
  },
  '&:hover': {
    filter: 'none',
    '&&': {
      backgroundColor: (theme) =>
        theme.palette.mode === 'light'
          ? theme.palette.grey[50]
          : theme.palette.grey[700],
      boxShadow: (theme) =>
        theme.palette.mode === 'light'
          ? '0 1px 3px rgba(0, 0, 0, 0.1)'
          : '0 2px 4px rgba(0, 0, 0, 0.25)',
    },
  },
  '&:active': {
    filter: 'none',
  },
  '& .MuiIcon-root': {
    fontSize: 20,
    flexShrink: 0,
    color: 'text.secondary',
  },
  '& p': {
    fontSize: 13,
    lineHeight: 1.3,
    textAlign: 'left',
    whiteSpace: 'normal',
    color: 'text.primary',
  },
};
