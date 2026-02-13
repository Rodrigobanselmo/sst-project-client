import chroma from 'chroma-js';

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
    contrastText: '#fff',
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

