/**
 * Fill de identidade/ação de marca.
 * Escuro = marca cheia + contraste (identity* ← emphasis).
 * Claro = marca soft + contraste (identity* ← soft, igual ao outlinedPrimary).
 * Não usar em status semântico nem em séries de dados.
 */
export const brandIdentityFillSx = {
  backgroundColor: 'primary.identityBackground',
  color: 'primary.identityOn',
  borderColor: 'primary.border',
} as const;

export const brandIdentityFillHoverSx = {
  backgroundColor: 'primary.identityBackgroundHover',
  color: 'primary.identityOn',
  borderColor: 'primary.border',
} as const;

export const brandIdentityButtonSchema = {
  color: 'primary.identityOn',
  borderColor: 'primary.border',
  iconColor: 'primary.identityOn',
  backgroundColor: 'primary.identityBackground',
} as const;

export const brandIdentityButtonSx = {
  ...brandIdentityFillSx,
  '& .MuiSvgIcon-root': { color: 'inherit' },
  '&:hover': {
    ...brandIdentityFillHoverSx,
    '& .MuiSvgIcon-root': { color: 'inherit' },
  },
} as const;

export const brandIdentityIdleSx = {
  color: 'primary.identityIdleOn',
} as const;

export const brandIdentityIconSx = {
  ...brandIdentityFillSx,
  border: '1px solid',
  borderColor: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'light' ? 'primary.border' : 'transparent',
} as const;

/**
 * Switch ON no Claro: fill soft da identidade.
 * OFF permanece neutro (sem marca cheia). Aplicar só em mode=light.
 */
export const brandIdentitySwitchLightSx = {
  '&& .MuiSwitch-switchBase': {
    color: 'text.main',
    '&.Mui-checked': {
      color: 'primary.identityOn',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: 'primary.identityBackground',
        borderColor: 'primary.border',
      },
    },
  },
} as const;

/**
 * Glifo de ação (lápis) no Escuro: cor da marca, sem fill.
 * Aplicar só em mode=dark.
 */
export const brandIdentityGlyphDarkSx = {
  color: 'primary.main',
  '& .MuiSvgIcon-root': { color: 'inherit' },
  '&:hover': {
    color: 'primary.identityBackgroundHover',
    backgroundColor: 'transparent',
  },
} as const;

/**
 * Quantidade/contador de tabela: marca no Escuro, leitura no Claro.
 * Não usar em status, chips semânticos ou lápis.
 */
export const brandIdentityQuantityColor = (theme: {
  palette: { mode: string };
}) => (theme.palette.mode === 'dark' ? 'primary.main' : 'text.main');

const outlinedHoverTargets =
  '& .MuiSvgIcon-root, & .MuiIcon-root, & svg, & .MuiBox-root' as const;

const outlinedHoverPaintDark = {
  color: 'primary.main',
  borderColor: 'primary.border',
  backgroundColor: 'transparent',
  [outlinedHoverTargets]: { color: 'primary.main' },
} as const;

const outlinedHoverPaintLight = {
  color: 'primary.identityOn',
  borderColor: 'primary.border',
  backgroundColor: 'primary.identityBackground',
  [outlinedHoverTargets]: { color: 'primary.identityOn' },
} as const;

/** Pintura de interação outlined (hover/focus/active) — resolve por modo. */
export const brandIdentityOutlinedInteractPaint = {
  color: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? 'primary.main' : 'primary.identityOn',
  borderColor: 'primary.border',
  backgroundColor: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? 'transparent' : 'primary.identityBackground',
  [outlinedHoverTargets]: {
    color: (theme: { palette: { mode: string } }) =>
      theme.palette.mode === 'dark' ? 'primary.main' : 'primary.identityOn',
  },
} as const;

/** Hover de controle outlined no Escuro: ícone/borda da marca, sem bloco amarelo. */
export const brandIdentityOutlinedHoverDarkSx = {
  '&:hover': outlinedHoverPaintDark,
  '&:focus-visible': outlinedHoverPaintDark,
  '&:active': outlinedHoverPaintDark,
} as const;

/** Hover de controle outlined no Claro: família soft, sem amarelo cheio. */
export const brandIdentityOutlinedHoverLightSx = {
  '&:hover': outlinedHoverPaintLight,
  '&:focus-visible': outlinedHoverPaintLight,
  '&:active': outlinedHoverPaintLight,
} as const;

/** Botão quadrado de ação (Atualizar / Upload): fill de identidade nos dois modos. */
export const brandIdentitySquareActionSx = {
  ...brandIdentityButtonSx,
  border: '1px solid',
  '& .MuiIcon-root, & .MuiSvgIcon-root, & svg': {
    color: 'primary.identityOn',
  },
  '&:hover': {
    ...brandIdentityFillHoverSx,
    '& .MuiIcon-root, & .MuiSvgIcon-root, & svg': {
      color: 'primary.identityOn',
    },
  },
} as const;

/** Toolbar compacta (30px): Adicionar / Atualizar / Upload — neutros em repouso. */
export const BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT = 30;

const toolbarNeutralRest = {
  backgroundColor: 'transparent',
  color: 'text.primary',
  borderColor: 'grey.600',
} as const;

const toolbarOutlinedInteraction = {
  '&:hover': { filter: 'none', ...brandIdentityOutlinedInteractPaint },
  '&:focus-visible': { filter: 'none', ...brandIdentityOutlinedInteractPaint },
  '&:active': { filter: 'none', ...brandIdentityOutlinedInteractPaint },
  '&&:hover': { filter: 'none', ...brandIdentityOutlinedInteractPaint },
  '&&:focus-visible': { filter: 'none', ...brandIdentityOutlinedInteractPaint },
  '&&:active': { filter: 'none', ...brandIdentityOutlinedInteractPaint },
} as const;

export const brandIdentityToolbarAddSx = {
  height: BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
  minHeight: BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
  borderRadius: 1,
  px: 3,
  minWidth: 'auto',
  boxShadow: 'none',
  '&&': toolbarNeutralRest,
  ...toolbarOutlinedInteraction,
  '& .MuiSvgIcon-root, & .MuiIcon-root, & svg': {
    fontSize: 16,
  },
} as const;

export const brandIdentityToolbarSquareSx = {
  height: BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
  minHeight: BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
  minWidth: BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
  maxWidth: BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
  width: BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
  p: 0,
  px: 0,
  borderRadius: 1,
  boxShadow: 'none',
  border: '1px solid',
  '&&': toolbarNeutralRest,
  ...toolbarOutlinedInteraction,
  '& .MuiIcon-root, & .MuiSvgIcon-root, & svg': {
    fontSize: '1rem',
  },
} as const;

/** Pílula de configuração da tabela (Colunas / Filtrar). */
export const BRAND_IDENTITY_TABLE_CONFIG_PILL = {
  height: BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
  minHeight: BRAND_IDENTITY_TOOLBAR_ACTION_HEIGHT,
  minWidth: 120,
  borderRadius: 3,
  px: 4,
} as const;

/** Preset opt-in: pílula neutra em repouso, identidade na interação. */
export const tableUtilityPillSx = {
  ...BRAND_IDENTITY_TABLE_CONFIG_PILL,
  boxShadow: 'none',
  '&&': toolbarNeutralRest,
  ...toolbarOutlinedInteraction,
} as const;

export const tableUtilityPillButtonProps = {
  variant: 'outlined' as const,
  color: 'paper' as const,
  schema: {
    backgroundColor: 'transparent',
    borderColor: 'grey.600',
    color: 'text.primary',
    iconColor: 'grey.600',
  },
  textProps: { color: 'text.primary' as const },
  buttonProps: { sx: tableUtilityPillSx },
};

/** Ação operacional de texto (Importar GSE / caracterização): geometria do Adicionar. */
export const tableOperationalButtonProps = {
  variant: 'outlined' as const,
  color: 'paper' as const,
  schema: {
    backgroundColor: 'transparent',
    borderColor: 'grey.600',
    color: 'text.primary',
    iconColor: 'grey.600',
  },
  textProps: { color: 'text.primary' as const },
  buttonProps: { sx: brandIdentityToolbarAddSx },
};

export const brandIdentityPaginationCurrentSx = {
  backgroundColor: 'primary.identityBackground',
  borderColor: 'primary.border',
  boxShadow: 'none',
  '& .text_main': { color: 'primary.identityOn' },
  '&:hover': {
    backgroundColor: 'primary.identityBackgroundHover',
    borderColor: 'primary.border',
  },
} as const;

export const brandIdentityPaginationIdleSx = {
  backgroundColor: 'background.paper',
  borderColor: 'divider',
  boxShadow: 'none',
  '& .text_main': { color: 'text.main' },
} as const;
