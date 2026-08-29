import React, { useMemo, ReactNode } from 'react';

import { ThemeProvider as EmotionProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@mui/material';

import { useResolvedVisualIdentity } from 'core/hooks/useResolvedVisualIdentity';

import { createCustomTheme } from '../../../configs/theme';
import {
  resolveInterfaceTheme,
  useInterfaceThemeOverride,
} from '../../../configs/theme/interface-theme-preference';

interface DynamicThemeProviderProps {
  children: ReactNode;
}

/**
 * Tema já resolvido pela API para o usuário no contexto operacional atual.
 * Identidade ativa → aplicar. Sem identidade → neutro (#4A5568).
 */
export const DynamicThemeProvider = ({
  children,
}: DynamicThemeProviderProps) => {
  const { visualIdentity } = useResolvedVisualIdentity();
  const themeOverride = useInterfaceThemeOverride();

  const theme = useMemo(() => {
    const interfaceTheme = resolveInterfaceTheme(
      visualIdentity?.interfaceTheme,
      themeOverride,
    );

    if (visualIdentity) {
      return createCustomTheme({
        primaryColor: visualIdentity.primaryColor || undefined,
        sidebarBackgroundColor:
          visualIdentity.sidebarBackgroundColor || undefined,
        interfaceTheme,
      });
    }

    return createCustomTheme({ interfaceTheme });
  }, [
    visualIdentity,
    visualIdentity?.primaryColor,
    visualIdentity?.sidebarBackgroundColor,
    visualIdentity?.interfaceTheme,
    themeOverride,
  ]);

  return (
    <EmotionProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </EmotionProvider>
  );
};
