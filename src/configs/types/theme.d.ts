/* eslint-disable @typescript-eslint/no-empty-interface */
import { Mixins } from '@mui/material/styles/createMixins';
import { Palette } from '@mui/material/styles/createPalette';

import mixins from '../theme/mixins';
import palette from '../theme/palette';

type CustomMixin = typeof mixins;
type CustomTheme = typeof palette;
type CustomThemeColors = typeof palette.primary;
type CustomThemeBackground = typeof palette.background;
type CustomThemeText = typeof palette.text;

interface NewTheme extends Palette {}
interface NewTheme extends CustomTheme {}
type NewMixins = Mixins & CustomMixin;

declare module '@emotion/react' {
  export interface Theme {
    palette: NewTheme;
    mixins: NewMixins;
  }
}

declare module '@mui/material/styles/createPalette' {
  interface Palette extends CustomTheme {}
  interface PaletteColor extends CustomThemeColors {}
  interface TypeBackground extends CustomThemeBackground {}
  interface TypeText extends CustomThemeText {}
}

declare module '@mui/material/styles/createMixins' {
  interface Mixins extends CustomMixin {}
}
