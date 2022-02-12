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
import { Provider } from 'react-redux';

import { ThemeProvider as EmotionProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { PersistGate } from 'redux-persist/integration/react';

import theme from '../../../configs/theme';
import { AuthProvider } from '../../../core/contexts/AuthContext';
import { queryClient } from '../../../core/services/queryClient';
import store, { persistor } from '../../../store';

const DefaultProviders: FC = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <EmotionProvider theme={theme}>
          <ThemeProvider theme={theme}>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <AuthProvider>
                <QueryClientProvider client={queryClient}>
                  {children}
                  <ReactQueryDevtools />
                </QueryClientProvider>
              </AuthProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </EmotionProvider>
      </PersistGate>
    </Provider>
  );
};

export default DefaultProviders;
