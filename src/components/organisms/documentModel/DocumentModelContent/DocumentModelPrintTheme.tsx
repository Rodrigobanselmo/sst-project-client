import React, { useMemo } from 'react';

import { ThemeProvider, useTheme } from '@mui/material/styles';
import { createCustomTheme } from 'configs/theme';

/** Tema Light isolado da folha/preview. Não altera chrome Dark nem output. */
export function DocumentModelPrintTheme({
  children,
}: {
  children: React.ReactNode;
}) {
  const appTheme = useTheme();
  const sheetTheme = useMemo(
    () =>
      createCustomTheme({
        interfaceTheme: 'light',
        primaryColor: appTheme.palette.primary.main,
      }),
    [appTheme.palette.primary.main],
  );

  return <ThemeProvider theme={sheetTheme}>{children}</ThemeProvider>;
}
