/**
 * Presets visuais do módulo Modelo Documento.
 * Opt-in local — não altera STagButton, STabs, STable nem o tema global.
 */

import {
  brandIdentityFillHoverSx,
  brandIdentityFillSx,
} from 'configs/theme/brand-identity-fill';

const identityOnPaint = {
  color: 'primary.identityOn',
  '& .text_main, & .icon_main, & .MuiIcon-root, & .MuiSvgIcon-root, & svg': {
    color: 'primary.identityOn',
  },
} as const;

/** Fill de identidade: texto e ícone sempre identityOn (nunca branco no amarelo). */
export const documentModelIdentityActionButtonSx = {
  ...brandIdentityFillSx,
  ...identityOnPaint,
  border: '1px solid',
  boxShadow: 'none',
  filter: 'none',
  '&:hover': {
    ...brandIdentityFillHoverSx,
    ...identityOnPaint,
    filter: 'none',
  },
  '&&': identityOnPaint,
} as const;

/** “+” de adicionar seção no editor — identidade, sem verde de sucesso. */
export const documentModelAddSectionButtonSx = {
  ...documentModelIdentityActionButtonSx,
  '& .text_main': { color: 'primary.identityOn' },
} as const;

/** Ícone/texto do STagButton herdam a cor do chip — sem amarelo isolado. */
export const documentModelClassicEditorInheritIconProps = {
  sx: { color: 'inherit' },
} as const;

export const documentModelClassicEditorInheritTextProps = {
  sx: { color: 'inherit' },
} as const;

function classicEditorChipPaint(color: string) {
  return {
    color,
    '&& .text_main, && .icon_main, && .MuiIcon-root, && .MuiSvgIcon-root, && svg':
      {
        color,
      },
  } as const;
}

/** Chips outlined da barra clássica do parágrafo (Estrutura / tipo). */
export const documentModelClassicEditorPrimaryChipSx =
  classicEditorChipPaint('primary.identityOn');

/** Conteúdo + e seletor de tipo (borda info). */
export const documentModelClassicEditorInfoChipSx =
  classicEditorChipPaint('info.dark');

/** Duplicar + (borda success). */
export const documentModelClassicEditorSuccessChipSx =
  classicEditorChipPaint('success.dark');

const dirtyOnPaint = {
  color: 'primary.identityOn',
  '& .MuiIcon-root, & .MuiSvgIcon-root, & svg': {
    color: 'primary.identityOn',
  },
} as const;

/**
 * Dirty/atenção: laranja de escala já existente (`scale.mediumHigh` / `graph.orange`).
 * `warning.main` é o amarelo institucional — não distingue do estado normal.
 */
export const documentModelDirtyActionButtonSx = {
  backgroundColor: 'scale.mediumHigh',
  border: '1px solid',
  borderColor: 'scale.mediumHigh',
  boxShadow: 'none',
  filter: 'none',
  ...dirtyOnPaint,
  '&:hover': {
    backgroundColor: 'scale.mediumHigh',
    borderColor: 'scale.mediumHigh',
    filter: 'brightness(0.88)',
    ...dirtyOnPaint,
  },
  '&&': dirtyOnPaint,
} as const;

/** Mapeia só a pintura. Não altera a condição de dirty (`error` / `error.main`). */
export function getDocumentModelSaveActionButtonSx(saveActionColor: string) {
  return saveActionColor === 'error.main' || saveActionColor === 'error'
    ? documentModelDirtyActionButtonSx
    : documentModelIdentityActionButtonSx;
}

const destructiveOnPaint = {
  color: 'error.main',
  '& .MuiIcon-root, & .MuiSvgIcon-root, & svg': {
    color: 'error.main',
  },
} as const;

/** Excluir: outlined error sóbrio. Não usar no estado dirty. */
export const documentModelDestructiveButtonSx = {
  backgroundColor: 'transparent',
  border: '1px solid',
  borderColor: 'error.main',
  boxShadow: 'none',
  filter: 'none',
  ...destructiveOnPaint,
  '&:hover': {
    backgroundColor: 'error.main',
    color: 'error.contrastText',
    borderColor: 'error.main',
    filter: 'none',
    '& .MuiIcon-root, & .MuiSvgIcon-root, & svg': {
      color: 'error.contrastText',
    },
  },
  '&&': destructiveOnPaint,
} as const;

/** Laterais da aba Documento: mesma largura/altura, texto em duas linhas. */
export const documentModelSidebarActionButtonSx = {
  ...documentModelIdentityActionButtonSx,
  height: 'auto',
  minHeight: 52,
  width: '100%',
  m: 0,
  ml: 0,
  px: 4,
  py: 2,
  whiteSpace: 'normal',
  lineHeight: 1.25,
  justifyContent: 'flex-start',
  textAlign: 'left',
  fontWeight: 600,
} as const;

export const documentModelSidebarActionBoxSx = {
  width: '100%',
  ml: 0,
} as const;

export const documentModelIdentityPillSx = {
  backgroundColor: 'primary.identityBackground',
  color: 'primary.identityOn',
  border: '1px solid',
  borderColor: 'primary.border',
} as const;

export const documentModelNeutralPillSx = {
  backgroundColor: 'background.box',
  color: 'text.primary',
  border: '1px solid',
  borderColor: 'divider',
} as const;

export const documentModelNeutralChipSx = {
  backgroundColor: 'background.box',
  color: 'text.primary',
  border: '1px solid',
  borderColor: 'divider',
} as const;

export function getDocumentModelFilterPillSx(isActive: boolean) {
  return isActive ? documentModelIdentityPillSx : documentModelNeutralPillSx;
}

export const documentModelFilterPillBaseSx = {
  appearance: 'none',
  cursor: 'pointer',
  borderRadius: 1,
  fontSize: 11,
  fontWeight: 600,
  px: 6,
  py: '4px',
  whiteSpace: 'nowrap',
} as const;

export const documentModelScopePillBaseSx = {
  ...documentModelFilterPillBaseSx,
  fontWeight: 700,
} as const;

export const documentModelWizardTabsSx = {
  '& .MuiTab-root': {
    color: 'text.secondary',
    fontWeight: 500,
    '&.Mui-selected': {
      color: (theme: { palette: { mode: string } }) =>
        theme.palette.mode === 'light' ? 'text.primary' : 'primary.main',
      fontWeight: 700,
    },
  },
} as const;

export const documentModelEditorToggleGroupSx = {
  '& .MuiToggleButton-root': {
    color: 'text.secondary',
    borderColor: 'divider',
    fontWeight: 700,
    textTransform: 'none',
    '&.Mui-selected': {
      backgroundColor: 'primary.identityBackground',
      color: 'primary.identityOn',
      borderColor: 'primary.border',
      '&:hover': {
        backgroundColor: 'primary.identityBackgroundHover',
        color: 'primary.identityOn',
      },
    },
    '&:hover': {
      backgroundColor: 'background.box',
    },
  },
} as const;

const v2ToolbarNeutralOnPaint = {
  color: 'text.secondary',
  '& .MuiIcon-root, & .MuiSvgIcon-root, & svg': {
    color: 'inherit',
  },
} as const;

const v2ToolbarHoverOnPaint = {
  color: 'text.primary',
  '& .MuiIcon-root, & .MuiSvgIcon-root, & svg': {
    color: 'inherit',
  },
} as const;

const v2ToolbarActiveOnPaint = {
  color: 'primary.identityOn',
  '& .MuiIcon-root, & .MuiSvgIcon-root, & svg': {
    color: 'primary.identityOn',
  },
} as const;

const v2ToolbarDisabledOnPaint = {
  color: 'text.disabled',
  '& .MuiIcon-root, & .MuiSvgIcon-root, & svg': {
    color: 'text.disabled',
  },
} as const;

/** Botão outlined/contained da toolbar V2 — neutro em repouso, identidade só se ativo. */
export const documentModelV2ToolbarButtonSx = {
  boxShadow: 'none',
  filter: 'none',
  textTransform: 'none',
  '&&': {
    borderColor: 'background.border',
    backgroundColor: 'background.paper',
    ...v2ToolbarNeutralOnPaint,
  },
  '&&:hover, &&:focus-visible': {
    borderColor: 'primary.border',
    backgroundColor: 'background.box',
    boxShadow: 'none',
    filter: 'none',
    ...v2ToolbarHoverOnPaint,
  },
  '&&.MuiButton-contained': {
    backgroundColor: 'primary.identityBackground',
    borderColor: 'primary.border',
    boxShadow: 'none',
    filter: 'none',
    ...v2ToolbarActiveOnPaint,
  },
  '&&.MuiButton-contained:hover, &&.MuiButton-contained:focus-visible': {
    backgroundColor: 'primary.identityBackgroundHover',
    borderColor: 'primary.border',
    boxShadow: 'none',
    filter: 'none',
    ...v2ToolbarActiveOnPaint,
  },
  '&&.Mui-disabled': {
    backgroundColor: 'background.disabled',
    borderColor: 'background.border',
    opacity: 1,
    ...v2ToolbarDisabledOnPaint,
  },
} as const;

/** Ícone da toolbar V2 — mesma família do outlined, sem cinza apagado. */
export const documentModelV2ToolbarIconButtonSx = {
  border: '1px solid',
  borderRadius: 1,
  boxShadow: 'none',
  filter: 'none',
  '&&': {
    borderColor: 'background.border',
    backgroundColor: 'background.paper',
    ...v2ToolbarNeutralOnPaint,
  },
  '&&:hover, &&:focus-visible': {
    borderColor: 'primary.border',
    backgroundColor: 'background.box',
    filter: 'none',
    ...v2ToolbarHoverOnPaint,
  },
  '&&.Mui-disabled': {
    backgroundColor: 'background.disabled',
    borderColor: 'background.border',
    opacity: 1,
    ...v2ToolbarDisabledOnPaint,
  },
} as const;

/** Select da toolbar V2 (tipo, tamanho, linha). */
export const documentModelV2ToolbarSelectSx = {
  '&&': {
    color: 'text.secondary',
    backgroundColor: 'background.paper',
  },
  '&& .MuiSelect-select': {
    color: 'text.secondary',
  },
  '&& .MuiSelect-icon': {
    color: 'text.secondary',
  },
  '&& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'background.border',
  },
  '&&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'primary.border',
  },
  '&&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'primary.border',
  },
  '&&.Mui-disabled': {
    color: 'text.disabled',
    opacity: 1,
    backgroundColor: 'background.disabled',
  },
  '&&.Mui-disabled .MuiSelect-select': {
    color: 'text.disabled',
    WebkitTextFillColor: 'unset',
  },
  '&&.Mui-disabled .MuiSelect-icon': {
    color: 'text.disabled',
  },
  '&&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
    borderColor: 'background.border',
  },
} as const;

/**
 * Escape do `outlinedPrimary` / `IconButton` default do tema.
 * Sem isso, `softBackground`+`onSoftBackground` (oliva) e `action.active`
 * (ícone 56%) vencem qualquer sx de ancestral.
 */
export const documentModelV2ToolbarControlColor = 'inherit' as const;

/**
 * `&&` no sx de ancestral NÃO pinta o filho: o Emotion dobra a classe do
 * wrapper (`.css-pai.css-pai .MuiButton-root`), que não existe no botão.
 * Manter só como documentação do contrato; aplicar os presets no controle.
 */
export const documentModelV2ToolbarChromeSx = {
  '& .MuiButton-root': documentModelV2ToolbarButtonSx,
  '& .MuiIconButton-root': documentModelV2ToolbarIconButtonSx,
  '& .MuiOutlinedInput-root': documentModelV2ToolbarSelectSx,
  '& .MuiTypography-root': {
    color: 'text.secondary',
  },
} as const;

/** Superfície da folha clássica (preview do documento, não chrome). */
export const documentModelClassicSheetSx = {
  bgcolor: 'common.white',
  color: 'text.primary',
  borderRadius: 1,
  overflow: 'hidden',
  mx: 8,
  mb: 8,
  boxShadow: '0 0 0 1px rgba(0,0,0,0.08)',
} as const;

export const documentModelTableStepSurfaceSx = {
  bgcolor: 'background.default',
  borderRadius: 1,
  p: 4,
  border: '1px solid',
  borderColor: 'divider',
} as const;
