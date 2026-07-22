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

/** Ação na coluna de candidato quando não há sugestão automática. */
export const FRPS_SEARCH_CANONICAL_ACTION_LABEL = 'Pesquisar canônico';

/** Ação na coluna quando há sugestão, para trocar o canônico manualmente. */
export const FRPS_CHOOSE_OTHER_CANONICAL_ACTION_LABEL =
  'Escolher outro canônico';

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

/**
 * Cabeçalho sticky abaixo da toolbar (top = altura medida da toolbar).
 * Exige TableContainer com overflow visível — overflow:auto cria containing
 * block e o offset da toolbar cobre as primeiras linhas do body.
 */
export const FRPS_LIBRARY_STICKY_TABLE_HEAD_SX: SxProps<Theme> = {
  position: 'sticky',
  top: 'var(--frps-library-sticky-offset, 0px)',
  zIndex: 11,
  bgcolor: 'background.paper',
  backgroundImage: 'none',
  boxShadow: '0 1px 0 0 rgba(0,0,0,0.08)',
};

/**
 * Evita containing block de sticky no TableContainer (MUI default overflowX:auto).
 * O scroll vertical fica no layout do dashboard; thead usa o offset da toolbar.
 */
export const FRPS_LIBRARY_TABLE_CONTAINER_SX: SxProps<Theme> = {
  overflow: 'visible',
};

export const FRPS_VALIDATE_CONCEPTUAL_BUTTON_LABEL = 'Validar explicação';

export const FRPS_VALIDATE_CONCEPTUAL_CONFIRM_TITLE =
  'Validar esta explicação conceitual?';

export const FRPS_VALIDATE_CONCEPTUAL_CONFIRM_BODY =
  'Após a validação, este conhecimento poderá ser reutilizado operacionalmente pelos aliases vinculados ao canônico. O conteúdo não será copiado para as empresas.';

export const FRPS_VALIDATE_CONCEPTUAL_SUCCESS_MESSAGE =
  'Explicação validada com sucesso.';
