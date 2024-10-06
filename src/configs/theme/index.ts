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
    MuiChip: {
      styleOverrides: {
        root: {
          height: 24,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {},
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          height: '22px',
          minWidth: '22px',
          '&&.MuiPaginationItem-root': {
            fontSize: '13px',
            borderRadius: '5px',
            backgroundColor: 'white',
            gap: '4px',
            boxShadow: '#0000004d 0px 1px 1px 0px',
          },
          '&&.MuiPaginationItem-ellipsis': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            border: 'none',
          },
          '&&.MuiPaginationItem-previousNext': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            border: 'none',
            height: '26px',
            minWidth: '26px',
            borderRadius: '50%',
            '&:hover': {
              backgroundColor: '#00000022',
            },
          },
        },
      },
    },
  },
});

export default defaultTheme;
