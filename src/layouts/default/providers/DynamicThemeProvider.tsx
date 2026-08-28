import React, { useMemo, ReactNode } from 'react';

import { ThemeProvider as EmotionProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider } from '@mui/material';

import { useFetchVisualIdentity } from '@v2/services/enterprise/visual-identity/read-visual-identity/hooks/useFetchVisualIdentity';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';

import defaultTheme, { createCustomTheme } from '../../../configs/theme';
import {
  resolveInterfaceTheme,
  useInterfaceThemeOverride,
} from '../../../configs/theme/interface-theme-preference';

interface DynamicThemeProviderProps {
  children: ReactNode;
}

/**
 * Provider que aplica tema dinâmico baseado nas configurações de identidade visual da empresa
 * Se visualIdentityEnabled estiver ativo, aplica marca, superfícies e tema claro/escuro.
 * Caso contrário, usa o tema padrão.
 *
 * A API retorna a identidade visual da empresa ou da consultora (fallback)
 */
export const DynamicThemeProvider = ({
  children,
}: DynamicThemeProviderProps) => {
  const { companyId, user } = useGetCompanyId();
  const themeCompanyId = companyId || user?.companyId || '';
  const { visualIdentity } = useFetchVisualIdentity({
    companyId: themeCompanyId,
  });
  const themeOverride = useInterfaceThemeOverride();

  const theme = useMemo(() => {
    const isVisualIdentityEnabled = visualIdentity?.visualIdentityEnabled;
    const interfaceTheme = resolveInterfaceTheme(
      visualIdentity?.interfaceTheme,
      themeOverride,
    );

    if (isVisualIdentityEnabled) {
      return createCustomTheme({
        primaryColor: visualIdentity?.primaryColor || undefined,
        sidebarBackgroundColor:
          visualIdentity?.sidebarBackgroundColor || undefined,
        interfaceTheme,
      });
    }

    if (themeOverride) {
      return createCustomTheme({ interfaceTheme: themeOverride });
    }

    return defaultTheme;
  }, [
    visualIdentity?.visualIdentityEnabled,
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
