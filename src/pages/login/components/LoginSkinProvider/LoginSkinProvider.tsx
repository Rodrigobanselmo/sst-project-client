import { ReactNode, useMemo } from 'react';

import { ThemeProvider as EmotionProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material';

import { createCustomTheme } from '../../../../configs/theme';
import { useInterfaceThemeOverride } from '../../../../configs/theme/interface-theme-preference';

/**
 * Amarelo institucional SimpleSST — o mesmo valor já usado em
 * AppLoading (`SIMPLESST_MARK_DARK`) e em brand-identity-fill.spec.
 * Injetado só neste ThemeProvider local para o login gerar tokens
 * `primary.*` / `identity*` sem alterar o fallback global.
 */
const SIMPLESST_PRODUCT_YELLOW = '#F6D040';

export function LoginSkinProvider({ children }: { children: ReactNode }) {
  const override = useInterfaceThemeOverride();
  const interfaceTheme = override === 'light' ? 'light' : 'dark';

  const theme = useMemo(
    () =>
      createCustomTheme({
        primaryColor: SIMPLESST_PRODUCT_YELLOW,
        interfaceTheme,
      }),
    [interfaceTheme],
  );

  return (
    <EmotionProvider theme={theme}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </EmotionProvider>
  );
}
