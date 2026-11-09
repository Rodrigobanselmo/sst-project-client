import { SIMPLESST_PRODUCT_YELLOW } from 'configs/theme/simplesst-product-identity';
import { darken, type Theme } from '@mui/material/styles';
export const gseActiveButtonSx = (theme: Theme) => ({
  '&&': {
    backgroundColor: SIMPLESST_PRODUCT_YELLOW,
    '& p, & svg': { color: theme.palette.getContrastText(SIMPLESST_PRODUCT_YELLOW) },
    '&:hover': { backgroundColor: darken(SIMPLESST_PRODUCT_YELLOW, 0.06) },
    '&:active': { backgroundColor: darken(SIMPLESST_PRODUCT_YELLOW, 0.1) },
    '&:focus-visible': { outline: `2px solid ${theme.palette.text.primary}`, outlineOffset: 2 },
  },
});
