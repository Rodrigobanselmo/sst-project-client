import '@fontsource/poppins';
import '@fontsource/poppins/100.css';
import '@fontsource/poppins/200.css';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/900.css';

import React, { FC } from 'react';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { Global, ThemeProvider as EmotionProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material';

import theme from '../../configs/theme';
import { queryClient } from '../../core/services/queryClient';
import globalStyles from '../../core/styles/globalStyles';
import { DashboardLayout } from '../dashboard';

const DefaultLayout: FC = ({ children }) => {
  return (
    <EmotionProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <main>
            <Global styles={globalStyles} />
            <DashboardLayout>{children}</DashboardLayout>
          </main>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </ThemeProvider>
    </EmotionProvider>
  );
};

export default DefaultLayout;
