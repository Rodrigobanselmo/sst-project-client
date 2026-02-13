import { createTheme, Theme } from '@mui/material/styles';
import { PaletteOptions } from '@mui/material/styles';
import { MixinsOptions } from '@mui/material/styles/createMixins';

import customMixins from './mixins';
import colors from './palette';
import shape from './shape';
import typography from './typography';
import { generatePaletteFromColor } from './generatePaletteFromColor';

const palette = colors as PaletteOptions;
const mixins = customMixins as MixinsOptions;

interface CustomThemeOptions {
  primaryColor?: string;
  sidebarBackgroundColor?: string;
  applicationBackgroundColor?: string;
}

/**
 * Cria um tema com cores customizadas baseadas na cor principal e configurações de cores
 * @param options - Opções de customização do tema
 * @returns Tema MUI configurado
 */
export function createCustomTheme(
  options?: CustomThemeOptions | string,
): Theme {
  // Suporte para chamada legada com apenas primaryColor como string
  const opts: CustomThemeOptions =
    typeof options === 'string' ? { primaryColor: options } : options || {};

  const { primaryColor, sidebarBackgroundColor, applicationBackgroundColor } =
    opts;

  let customPalette = { ...colors };

  if (primaryColor) {
    const generatedColors = generatePaletteFromColor(primaryColor);
    if (generatedColors) {
      customPalette = {
        ...colors,
        primary: generatedColors.primary,
        mainBlur: generatedColors.mainBlur,
      };
    }
  }

  // Aplicar cor customizada da sidebar
  if (sidebarBackgroundColor) {
    customPalette = {
      ...customPalette,
      sidebar: {
        ...customPalette.sidebar,
        background: sidebarBackgroundColor,
      },
    };
  }

  // Aplicar cor customizada do fundo da aplicação
  if (applicationBackgroundColor) {
    customPalette = {
      ...customPalette,
      background: {
        ...customPalette.background,
        default: applicationBackgroundColor,
      },
    };
  }

  return createTheme({
    palette: customPalette as PaletteOptions,
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
                borderColor: customPalette.primary.main + ' !important',
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
                  color: customPalette.primary.main,
                },
              },
            ],
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            padding: '8px 16px',
            border: '2px solid var(--mui-palette-grey-200)',
            borderRadius: '8px !important',
            boxShadow: 'unset !important',
            '& .MuiAccordionSummary-root': {
              padding: ' 4px 0px !important',
            },
            '&.Mui-expanded': {
              margin: '0px !important',
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            minHeight: 'unset !important',
            margin: '0 !important',
            '& .MuiAccordionSummary-content': {
              alignItems: 'center !important',
              margin: '0 !important',
            },
          },
        },
      },
    },
  });
}

const defaultTheme = createCustomTheme();

export default defaultTheme;
