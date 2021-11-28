import { createTheme } from '@mui/material/styles';
import { PaletteOptions } from '@mui/material/styles';

import colors from './palette';
import shape from './shape';
import typography from './typography';

const palette = colors as PaletteOptions;

const defaultTheme = createTheme({
  palette,
  typography,
  shape,
  spacing: (factor: number) => `${0.125 * factor}rem`, // (Bootstrap strategy) 4px
});

export default defaultTheme;
