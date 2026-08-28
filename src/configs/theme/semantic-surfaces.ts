import colors from './palette';

export type InterfaceTheme = 'light' | 'dark';

export function parseInterfaceTheme(value: unknown): InterfaceTheme {
  return value === 'dark' ? 'dark' : 'light';
}

const lightBackground = colors.background;
const lightText = colors.text;

export const lightSurfaceTokens = {
  background: { ...lightBackground },
  text: {
    ...lightText,
    primary: lightText.main,
    secondary: lightText.medium,
    disabled: lightText.lightest,
  },
};

export const darkSurfaceTokens = {
  background: {
    default: '#12151C',
    paper: '#1A202C',
    darkPaper: '#12151C',
    dark: '#1A202C',
    divider: '#2D3748',
    border: '#4A5568',
    lightGray: '#1F2530',
    box: '#222833',
    disabled: '#2D3748',
  },
  text: {
    dark: '#FFFFFF',
    main: '#E2E8F0',
    medium: '#CBD5E0',
    light: '#A0AEC0',
    lightest: '#718096',
    label: '#A0AEC0',
    primary: '#E2E8F0',
    secondary: '#A0AEC0',
    disabled: '#718096',
  },
};

export function getSurfaceTokens(mode: InterfaceTheme) {
  return mode === 'dark' ? darkSurfaceTokens : lightSurfaceTokens;
}
