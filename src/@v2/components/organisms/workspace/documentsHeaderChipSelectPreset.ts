import type { SxProps, Theme } from '@mui/material';

/**
 * Shell (STBox) e input — header global (empresa / estabelecimento).
 */
export const DOCUMENTS_HEADER_CHIP_MIN_WIDTH_PX = 220;
export const DOCUMENTS_HEADER_CHIP_MAX_WIDTH_PX = 320;

/** Altura útil do campo Autocomplete (só área do input, sem label). */
export const DOCUMENTS_HEADER_CHIP_INPUT_HEIGHT_PX = 24;

export const documentsHeaderChipShellSx = {
  flexShrink: 0,
  minWidth: DOCUMENTS_HEADER_CHIP_MIN_WIDTH_PX,
  maxWidth: DOCUMENTS_HEADER_CHIP_MAX_WIDTH_PX,
  alignItems: 'center',
  /** Reduz o padding padrão do STBox (3px 7px) para o chip ficar mais baixo. */
  py: '2px',
  px: '6px',
} as const;

/** Row height estimate for dynamic list max-height (compact header selects). */
export const HEADER_CHIP_ROW_PX = 40;

/** Altura máxima do dropdown de estabelecimento/empresa no header (~65vh). */
export const HEADER_CHIP_LIST_VIEWPORT_RATIO = 0.65;

export const HEADER_CHIP_LIST_MIN_PX = 96;

export function getHeaderChipViewportMaxHeightPx(): number {
  if (typeof globalThis !== 'undefined' && 'innerHeight' in globalThis) {
    return Math.floor(
      (globalThis as Window & typeof globalThis).innerHeight *
        HEADER_CHIP_LIST_VIEWPORT_RATIO,
    );
  }
  return 480;
}

export function getHeaderChipListMaxHeightPx(optionCount: number): number {
  const vhCap = getHeaderChipViewportMaxHeightPx();
  const content = optionCount * HEADER_CHIP_ROW_PX + 12;
  return Math.min(Math.max(content, HEADER_CHIP_LIST_MIN_PX), vhCap);
}

export function headerChipCompactListSx(
  listMaxHeightPx: number,
): SxProps<Theme> {
  return {
    maxHeight: listMaxHeightPx,
    overflowY: 'auto',
    py: 0.5,
    '& li': {
      alignItems: 'flex-start',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      py: 0.75,
      fontSize: 11,
      borderBottom: '1px solid #e0e0e0',
    },
    '& li:last-of-type': { borderBottom: 'none' },
  };
}

export const headerChipDefaultListSx = (
  listMaxHeightPx: number,
): SxProps<Theme> => ({
  maxHeight: listMaxHeightPx,
  overflowY: 'auto',
  p: 0,
  '& li': { borderBottom: '1px solid #e0e0e0' },
  '& li:last-child': { borderBottom: 'none' },
});

/** Input compacto — usado só no header de Documentos (compact). */
export const headerChipCompactInputProps = {
  hiddenLabel: true as const,
  size: 'sm' as const,
  sx: {
    m: 0,
    '& .MuiOutlinedInput-root': {
      maxHeight: DOCUMENTS_HEADER_CHIP_INPUT_HEIGHT_PX,
      minHeight: DOCUMENTS_HEADER_CHIP_INPUT_HEIGHT_PX,
      py: 0,
      pr: '22px !important',
      pl: '6px !important',
      bgcolor: 'transparent',
    },
    '& fieldset': { border: 'none' },
    '& .MuiInputBase-input': {
      py: 0,
      px: 0,
      fontSize: 11,
      lineHeight: 1.2,
    },
    '& .MuiAutocomplete-input': {
      minWidth: '0 !important',
    },
    '& .MuiAutocomplete-endAdornment': {
      right: 2,
      top: '50%',
      transform: 'translateY(-50%)',
    },
  },
};

export const headerChipCompactAutocompleteSx: SxProps<Theme> = {
  width: '100%',
  minWidth: 0,
  maxWidth: 'none',
  flex: '1 1 auto',
  '& .MuiOutlinedInput-root .MuiAutocomplete-input': {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
};

export function headerChipCompactPaperComponentsProps(listMaxHeightPx: number) {
  return {
    paper: {
      sx: {
        width: 'max-content',
        minWidth: '100%',
        maxWidth: 'min(560px, 92vw)',
        maxHeight: listMaxHeightPx,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      },
    },
  } as const;
}
