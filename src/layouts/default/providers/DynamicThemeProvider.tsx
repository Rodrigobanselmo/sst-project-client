import React, { useMemo, ReactNode } from 'react';

import { ThemeProvider as EmotionProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material';

import { useAuth } from 'core/contexts/AuthContext';
import { useFetchVisualIdentity } from '@v2/services/enterprise/visual-identity/read-visual-identity/hooks/useFetchVisualIdentity';

import defaultTheme, { createCustomTheme } from '../../../configs/theme';

interface DynamicThemeProviderProps {
  children: ReactNode;
}

/**
 * Provider que aplica tema dinâmico baseado nas configurações de identidade visual da empresa
 * Se visualIdentityEnabled estiver ativo e primaryColor definida, aplica a cor customizada
 * Caso contrário, usa o tema padrão
 *
 * A API retorna a identidade visual da empresa ou da consultora (fallback)
 */
export const DynamicThemeProvider = ({
  children,
}: DynamicThemeProviderProps) => {
  const { user } = useAuth();
  const { visualIdentity } = useFetchVisualIdentity({
    companyId: user?.companyId || '',
  });

  const theme = useMemo(() => {
    // Verificar se a identidade visual está ativada
    const isVisualIdentityEnabled = visualIdentity?.visualIdentityEnabled;

    if (isVisualIdentityEnabled) {
      const primaryColor = visualIdentity?.primaryColor;
      const sidebarBackgroundColor = visualIdentity?.sidebarBackgroundColor;
      const applicationBackgroundColor =
        visualIdentity?.applicationBackgroundColor;

      // Se alguma customização está definida, criar tema customizado
      if (
        primaryColor ||
        sidebarBackgroundColor ||
        applicationBackgroundColor
      ) {
        return createCustomTheme({
          primaryColor: primaryColor || undefined,
          sidebarBackgroundColor: sidebarBackgroundColor || undefined,
          applicationBackgroundColor: applicationBackgroundColor || undefined,
        });
      }
    }

    return defaultTheme;
  }, [
    visualIdentity?.visualIdentityEnabled,
    visualIdentity?.primaryColor,
    visualIdentity?.sidebarBackgroundColor,
    visualIdentity?.applicationBackgroundColor,
  ]);

  return (
    <EmotionProvider theme={theme}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </EmotionProvider>
  );
};
