import { createTheme } from '@mui/material/styles';
import { PaletteOptions } from '@mui/material/styles';
import { MixinsOptions } from '@mui/material/styles/createMixins';

import customMixins from './mixins';
import colors from './palette';
import shape from './shape';
import typography from './typography';

const palette = colors as PaletteOptions;
const mixins = customMixins as MixinsOptions;

const defaultTheme = createTheme({
  palette,
  typography,
  shape,
  mixins,
  spacing: (factor: number) => `${0.125 * factor}rem`, // (Bootstrap strategy) 4px
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ul: {
          listStyle: 'none',
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: { verticalAlign: 'middle' },
      },
    },
  },
});

export default defaultTheme;
