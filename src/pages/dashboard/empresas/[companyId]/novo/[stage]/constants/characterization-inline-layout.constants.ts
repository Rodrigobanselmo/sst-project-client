/** vh fallback — compatível com Safari (incl. versões sem suporte a dvh). */
export const CHARACTERIZATION_INLINE_EDITOR_HEIGHT_VH =
  'calc(100vh - 11rem)';

/** vh fallback para aba Fatores de Riscos no editor inline. */
export const CHARACTERIZATION_INLINE_RISK_TOOL_HEIGHT_VH =
  'calc(100vh - 18rem)';

/** Progressive enhancement quando o browser suporta dvh (Chrome, Safari recente). */
export const CHARACTERIZATION_INLINE_EDITOR_HEIGHT_DVH =
  'calc(100dvh - 11rem)';

export const CHARACTERIZATION_INLINE_RISK_TOOL_HEIGHT_DVH =
  'calc(100dvh - 18rem)';

/** @deprecated Preferir *_VH ou inlineRiskToolHeightSx */
export const CHARACTERIZATION_INLINE_EDITOR_HEIGHT =
  CHARACTERIZATION_INLINE_EDITOR_HEIGHT_VH;

/** @deprecated Preferir *_VH ou inlineRiskToolHeightSx */
export const CHARACTERIZATION_INLINE_RISK_TOOL_HEIGHT =
  CHARACTERIZATION_INLINE_RISK_TOOL_HEIGHT_VH;

/** Altura da aba Fatores de Riscos — vh com fallback @supports dvh. */
export const inlineRiskToolHeightSx = {
  height: CHARACTERIZATION_INLINE_RISK_TOOL_HEIGHT_VH,
  minHeight: 420,
  '@supports (height: 100dvh)': {
    height: CHARACTERIZATION_INLINE_RISK_TOOL_HEIGHT_DVH,
  },
} as const;
