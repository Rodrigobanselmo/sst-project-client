/* eslint-disable @typescript-eslint/no-empty-interface */
import { Palette } from '@mui/material/styles/createPalette';

import palette from '../theme/palette';

type CustomTheme = typeof palette;
type CustomThemeColors = typeof palette.primary;
type CustomThemeBackground = typeof palette.background;
type CustomThemeText = typeof palette.text;

interface NewTheme extends Palette {}
interface NewTheme extends CustomTheme {}

declare module '@emotion/react' {
  export interface Theme {
    palette: NewTheme;
  }
}

declare module '@mui/material/styles/createPalette' {
  interface Palette extends CustomTheme {}
  interface PaletteColor extends CustomThemeColors {}
  interface TypeBackground extends CustomThemeBackground {}
  interface TypeText extends CustomThemeText {}
}
