import type { SxProps, Theme } from '@mui/material';

/** A cor da marca pode ser clara (ex.: amarelo) e sem contraste sobre fundo branco. */
export const hoMethodLinkSx: SxProps<Theme> = {
  color: (theme) =>
    theme.palette.mode === 'dark'
      ? theme.palette.primary.main
      : theme.palette.secondary.main,
  textDecorationColor: 'currentColor',
};
