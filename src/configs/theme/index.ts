import { createTheme } from '@mui/material/styles';

import palette from './palette';
import shape from './shape';
import typography from './typography';

const defaultTheme = createTheme({
  palette,
  typography,
  shape,
});

export default defaultTheme;
