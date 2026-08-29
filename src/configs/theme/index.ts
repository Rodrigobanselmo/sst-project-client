import { createTheme, Theme } from '@mui/material/styles';
import { PaletteOptions } from '@mui/material/styles';
import { MixinsOptions } from '@mui/material/styles/createMixins';

import customMixins from './mixins';
import colors from './palette';
import shape from './shape';
import typography from './typography';
import {
  generatePaletteFromColor,
  getPrimaryInteractiveTokens,
} from './generatePaletteFromColor';
import {
  getSurfaceTokens,
  parseInterfaceTheme,
  type InterfaceTheme,
} from './semantic-surfaces';
import { NEUTRAL_PRIMARY_COLOR } from './neutral-primary';

const mixins = customMixins as MixinsOptions;

interface CustomThemeOptions {
  primaryColor?: string;
  sidebarBackgroundColor?: string;
  interfaceTheme?: InterfaceTheme | string;
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

  const { primaryColor, sidebarBackgroundColor, interfaceTheme } = opts;

  const mode = parseInterfaceTheme(interfaceTheme);
  const surfaces = getSurfaceTokens(mode);

  let customPalette = {
    ...colors,
    mode,
    background: { ...surfaces.background },
    text: { ...surfaces.text },
    divider: surfaces.background.divider,
  };

  const brandColor = primaryColor || NEUTRAL_PRIMARY_COLOR;
  const generatedColors = generatePaletteFromColor(brandColor);
  if (generatedColors) {
    customPalette = {
      ...customPalette,
      primary: {
        ...customPalette.primary,
        ...generatedColors.primary,
      },
      mainBlur: generatedColors.mainBlur,
    };
  }

  // Sidebar permanece independente do modo claro/escuro
  if (sidebarBackgroundColor) {
    customPalette = {
      ...customPalette,
      sidebar: {
        ...customPalette.sidebar,
        background: sidebarBackgroundColor,
      },
    };
  }

  const brand = customPalette.primary.main;
  const paper = customPalette.background.paper;
  const textMain = customPalette.text.main;
  const interactive = getPrimaryInteractiveTokens(brand, mode, paper);

  customPalette = {
    ...customPalette,
    primary: {
      ...customPalette.primary,
      ...interactive,
    },
  };

  const {
    softBackground,
    softBackgroundHover,
    border: brandBorder,
    onSoftBackground,
  } = interactive;
  const labelColor = customPalette.text.label;

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
          html: {
            backgroundColor: customPalette.background.default,
            colorScheme: mode,
          },
          body: {
            backgroundColor: customPalette.background.default,
            color: textMain,
          },
        },
      },
      MuiBreadcrumbs: {
        styleOverrides: {
          root: {
            '& .MuiBreadcrumbs-li, & .MuiLink-root, & .MuiTypography-root': {
              color: mode === 'dark' ? brand : textMain,
              fontWeight: 500,
            },
            '& .MuiSvgIcon-root': {
              color: mode === 'dark' ? brand : textMain,
              opacity: 0.72,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: paper,
            backgroundImage: 'none',
            color: textMain,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: paper,
            backgroundImage: 'none',
            color: textMain,
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundColor: paper,
            backgroundImage: 'none',
            color: textMain,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: paper,
            backgroundImage: 'none',
            color: textMain,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: paper,
            backgroundImage: 'none',
            color: textMain,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: customPalette.background.divider,
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: labelColor,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: labelColor,
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            backgroundColor: paper,
            color: textMain,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: customPalette.background.divider,
            color: textMain,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            height: 24,
          },
          colorPrimary: {
            backgroundColor: brand,
            color: customPalette.primary.contrastText,
          },
          outlinedPrimary: {
            backgroundColor: softBackground,
            color: onSoftBackground,
            borderColor: brandBorder,
          },
          deleteIcon: {
            width: 16,
            height: 16,
          },
          deleteIconColorPrimary: {
            color: customPalette.primary.contrastText,
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: { verticalAlign: 'middle' },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: brand,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: customPalette.text.medium,
            '&.Mui-selected': {
              color: onSoftBackground,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: brand,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            color: brand,
            '&.Mui-checked': {
              color: customPalette.primary.contrastText,
              '& + .MuiSwitch-track': {
                backgroundColor: brand,
                opacity: 1,
                borderColor: brand,
              },
            },
          },
          thumb: {
            backgroundColor: 'currentColor',
          },
          track: {
            backgroundColor: customPalette.background.disabled,
            opacity: 1,
            boxSizing: 'border-box',
            ...(mode === 'light'
              ? { border: `1px solid ${textMain}` }
              : {}),
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          outlinedPrimary: {
            color: onSoftBackground,
            borderColor: brandBorder,
            backgroundColor: softBackground,
            '&:hover': {
              color: onSoftBackground,
              borderColor: brandBorder,
              backgroundColor: softBackgroundHover,
            },
          },
          textPrimary: {
            color: onSoftBackground,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            color: textMain,
            backgroundColor: paper,
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                border: '2px solid',
                borderColor: brandBorder + ' !important',
                outline: 'none',
              },
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: paper,
            color: textMain,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            backgroundColor: paper,
            color: textMain,
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            backgroundColor: paper,
            color: textMain,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: textMain,
            '&.Mui-selected': {
              backgroundColor: softBackground,
              color: onSoftBackground,
              '&:hover': {
                backgroundColor: softBackgroundHover,
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
              backgroundColor: paper,
              color: textMain,
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
                backgroundColor: mode === 'dark' ? '#ffffff22' : '#00000022',
              },
            },
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            padding: '8px 16px',
            border: `2px solid ${customPalette.background.border}`,
            borderRadius: '8px !important',
            boxShadow: 'unset !important',
            backgroundColor: paper,
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
