import chroma from 'chroma-js';

import { NEUTRAL_PRIMARY_COLOR } from './neutral-primary';

const CONTRAST_TEXT_LIGHT = '#ffffff';
const CONTRAST_TEXT_DARK = '#1A202C';
/**
 * WCAG relative luminance above this is treated as a light brand color.
 * #F27329 (current orange) is ~0.31 → white; #F6D040 is ~0.65 → dark.
 */
const LIGHT_BRAND_LUMINANCE_THRESHOLD = 0.45;

/**
 * Foreground that stays readable on `background`. Does not modify the brand color.
 */
export function getPrimaryContrastText(background: string): string {
  return chroma(background).luminance() > LIGHT_BRAND_LUMINANCE_THRESHOLD
    ? CONTRAST_TEXT_DARK
    : CONTRAST_TEXT_LIGHT;
}

export type PrimaryInteractiveTokens = {
  softBackground: string;
  softBackgroundHover: string;
  border: string;
  onSoftBackground: string;
  emphasisBackground: string;
  emphasisBackgroundHover: string;
  onEmphasis: string;
};

const LIGHT_BORDER_CONTRAST = 3;
const LIGHT_FILL_DELTA_E = 12;
const DARK_FILL_DELTA_E = 8;
/** Opaque mix toward white for light-mode principal fills (not alpha). */
const LIGHT_EMPHASIS_WHITE_MIX = 0.22;
/** Hover stays in the same family, closer to the raw brand. */
const LIGHT_EMPHASIS_HOVER_WHITE_MIX = 0.08;
const WHITE = '#ffffff';

function mixBrandOnSurface(brand: string, surface: string, amount: number) {
  return chroma.mix(surface, brand, amount, 'rgb');
}

function readableBrandOnSurface(brand: string, surface: string): string {
  if (chroma.contrast(brand, surface) >= LIGHT_BORDER_CONTRAST) {
    return brand;
  }

  const darkenSurface = chroma(surface).luminance() > LIGHT_BRAND_LUMINANCE_THRESHOLD;
  let color = chroma(brand);

  for (let i = 0; i < 12; i++) {
    color = darkenSurface ? color.darken(0.28) : color.brighten(0.28);
    if (chroma.contrast(color, surface) >= LIGHT_BORDER_CONTRAST) {
      return color.hex();
    }
  }

  return getPrimaryContrastText(surface);
}

function visibleBrandFill(brand: string, surface: string, mode: 'light' | 'dark') {
  const minDeltaE = mode === 'dark' ? DARK_FILL_DELTA_E : LIGHT_FILL_DELTA_E;
  let amount = mode === 'dark' ? 0.16 : 0.14;
  let fill = mixBrandOnSurface(brand, surface, amount);

  while (chroma.deltaE(fill, surface) < minDeltaE && amount < 0.42) {
    amount += 0.03;
    fill = mixBrandOnSurface(brand, surface, amount);
  }

  const hover = mixBrandOnSurface(brand, surface, Math.min(amount + 0.1, 0.52));
  return { fill, hover };
}

function getEmphasisTokens(brand: string, mode: 'light' | 'dark') {
  if (mode === 'dark') {
    return {
      emphasisBackground: brand,
      emphasisBackgroundHover: chroma(brand).darken(0.35).hex(),
      onEmphasis: getPrimaryContrastText(brand),
    };
  }

  const emphasisBackground = chroma
    .mix(brand, WHITE, LIGHT_EMPHASIS_WHITE_MIX, 'rgb')
    .hex();
  const emphasisBackgroundHover = chroma
    .mix(brand, WHITE, LIGHT_EMPHASIS_HOVER_WHITE_MIX, 'rgb')
    .hex();

  return {
    emphasisBackground,
    emphasisBackgroundHover,
    onEmphasis: getPrimaryContrastText(emphasisBackground),
  };
}

/**
 * Secondary (soft*) and principal (emphasis*) surfaces derived from the brand.
 * Dark principal fills stay on the raw brand; light principal fills mix with white.
 */
export function getPrimaryInteractiveTokens(
  brand: string,
  mode: 'light' | 'dark',
  surface: string,
): PrimaryInteractiveTokens {
  const safeBrand = chroma.valid(brand) ? brand : NEUTRAL_PRIMARY_COLOR;
  const safeSurface = chroma.valid(surface)
    ? surface
    : mode === 'dark'
      ? '#1A202C'
      : '#FFFFFF';

  const { fill, hover } = visibleBrandFill(safeBrand, safeSurface, mode);
  const border =
    mode === 'dark' ? safeBrand : readableBrandOnSurface(safeBrand, safeSurface);
  const onSoft =
    chroma.contrast(border, fill) >= LIGHT_BORDER_CONTRAST
      ? border
      : getPrimaryContrastText(fill.hex());

  const { emphasisBackground, emphasisBackgroundHover, onEmphasis } =
    getEmphasisTokens(safeBrand, mode);

  return {
    softBackground: fill.hex(),
    softBackgroundHover: hover.hex(),
    border,
    onSoftBackground: onSoft,
    emphasisBackground,
    emphasisBackgroundHover,
    onEmphasis,
  };
}

/**
 * Gera uma paleta de cores derivadas a partir de uma cor principal
 * @param mainColor - Cor principal em formato hex (ex: "#F27329")
 * @returns Objeto com cores primary e mainBlur derivadas
 */
export function generatePaletteFromColor(mainColor: string) {
  // Validar se a cor é válida
  if (!mainColor || !chroma.valid(mainColor)) {
    return null;
  }

  const color = chroma(mainColor);
  const rgb = color.rgb();

  // Gerar variações da cor principal
  const primary = {
    extraLight: color.brighten(1.5).hex(),
    light: color.brighten(0.5).hex(),
    main: mainColor,
    dark: color.darken(0.8).hex(),
    extraDark: color.darken(1.5).hex(),
    contrastText: getPrimaryContrastText(mainColor),
  };

  // Gerar cores com transparência (mainBlur)
  const mainBlur = {
    90: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.9)`,
    80: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.8)`,
    70: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.7)`,
    60: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.6)`,
    50: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.5)`,
    40: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.4)`,
    30: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.3)`,
    20: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.2)`,
    10: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.1)`,
    5: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.05)`,
  };

  return {
    primary,
    mainBlur,
  };
}
