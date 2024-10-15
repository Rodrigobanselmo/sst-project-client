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
    MuiChip: {
      styleOverrides: {
        root: {
          height: 24,
          backgroundColor: 'transparent',
          color: 'primary.main',
          border: '1px solid',
          borderColor: 'primary.main',
        },
        deleteIcon: {
          width: 16,
          height: 16,
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: { verticalAlign: 'middle' },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              border: '2px solid',
              borderColor: colors.primary.main + ' !important',
              outline: 'none',
            },
          },
        },
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
    MuiMenuItem: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { selected: true },
              style: {
                color: colors.primary.main,
              },
            },
          ],
        },
      },
    },
  },
});

export default defaultTheme;
