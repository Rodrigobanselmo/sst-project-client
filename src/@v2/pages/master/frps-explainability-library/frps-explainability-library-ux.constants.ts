import type { SxProps, Theme } from '@mui/material';

/** Chip “Canônico”: contraste acessível na identidade SimpleSST (laranja). */
export const FRPS_CANONICAL_CHIP_SX: SxProps<Theme> = {
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  border: '1px solid',
  borderColor: 'primary.dark',
  fontWeight: 700,
  '& .MuiChip-label': {
    color: 'primary.contrastText',
    px: 0.75,
  },
};

/** Recuo só na 1ª coluna (Nome), sem deslocar as demais. */
export const FRPS_ALIAS_NAME_INDENT_PX = 28;

export const FRPS_LINK_TO_CANONICAL_BUTTON_LABEL = 'Vincular ao canônico';

export function buildFrpsLinkToCanonicalButtonLabel(count: number): string {
  return `${FRPS_LINK_TO_CANONICAL_BUTTON_LABEL} (${count})`;
}

export const FRPS_EQUIVALENCE_DIALOG_TITLE = 'Vincular ao canônico global';

export function buildFrpsEquivalenceDialogConfirmLabel(count: number): string {
  return `Vincular ${count} ${count === 1 ? 'item' : 'itens'}`;
}

/** Área superior sticky (filtros / seleção). */
export const FRPS_LIBRARY_STICKY_TOOLBAR_SX: SxProps<Theme> = {
  position: 'sticky',
  top: 0,
  zIndex: 12,
  bgcolor: 'background.paper',
  borderBottom: 1,
  borderColor: 'divider',
  boxShadow: 1,
  pt: 1,
  pb: 1.5,
  mb: 1.5,
};

/** Cabeçalho da tabela sticky, abaixo da toolbar (top dinâmico via CSS var). */
export const FRPS_LIBRARY_STICKY_TABLE_HEAD_SX: SxProps<Theme> = {
  top: 'var(--frps-library-sticky-offset, 0px)',
  zIndex: 11,
  bgcolor: 'background.paper',
  boxShadow: '0 1px 0 0 rgba(0,0,0,0.08)',
};
