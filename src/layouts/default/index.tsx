import '@fontsource/poppins';

import { Global, ThemeProvider as EmotionProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material';
import React, { FC } from 'react';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import theme from '../../configs/theme';
import { queryClient } from '../../core/services/queryClient';
import globalStyles from '../../core/styles/globalStyles';

const DefaultLayout: FC = ({ children }) => {
  return (
    <EmotionProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <main>
            <Global styles={globalStyles} />
            {children}
          </main>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </ThemeProvider>
    </EmotionProvider>
  );
};

export default DefaultLayout;
