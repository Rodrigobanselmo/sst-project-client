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
import { QueryClientProvider as OldQueryClientProvider } from 'react-query';
import { ReactQueryDevtools as OldReactQueryDevtools } from 'react-query/devtools';
import { Provider } from 'react-redux';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ThemeProvider as EmotionProvider } from '@emotion/react';
import { Icon, ThemeProvider } from '@mui/material';
import SCloseIcon from 'assets/icons/SCloseIcon';
import SIconButton from 'components/atoms/SIconButton';
import { SnackbarKey, SnackbarProvider } from 'notistack';
import { PersistGate } from 'redux-persist/integration/react';

import { OnlineStatusProvider } from 'core/hooks/useOnlineStatus';

import theme from '../../../configs/theme';
import { AuthProvider } from '../../../core/contexts/AuthContext';
import { queryClient as oldQueryClient } from '../../../core/services/queryClient';
import store, { persistor } from '../../../store';
import { KBarProvider } from '../KBar/KBarProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const QueryClientProviderComponent = OldQueryClientProvider as any;

export const queryClient = new QueryClient();

const DefaultProviders: FC<React.PropsWithChildren<any>> = ({ children }) => {
  const notistackRef = React.createRef<SnackbarProvider>();
  const onClickDismiss = (key: SnackbarKey) => () => {
    if (notistackRef.current) notistackRef.current?.closeSnackbar(key);
  };

  return (
    <Provider store={store}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <PersistGate loading={null} persistor={persistor}>
          <OnlineStatusProvider>
            <EmotionProvider theme={theme}>
              <ThemeProvider theme={theme}>
                <SnackbarProvider
                  ref={notistackRef}
                  maxSnack={3}
                  preventDuplicate
                  action={(key) => (
                    <SIconButton
                      onClick={onClickDismiss(key)}
                      sx={{
                        width: '2rem',
                        height: '2rem',
                        position: 'absolute',
                        right: '8px',
                        top: '8px',
                      }}
                    >
                      <Icon
                        sx={{ color: 'common.white', fontSize: '18px' }}
                        component={SCloseIcon}
                      />
                    </SIconButton>
                  )}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  style={{ maxWidth: '28rem', paddingRight: 40 }}
                >
                  <AuthProvider>
                    <QueryClientProvider client={queryClient}>
                      <ReactQueryDevtools initialIsOpen={false} />
                      <QueryClientProviderComponent client={oldQueryClient}>
                        <KBarProvider>{children}</KBarProvider>
                        <OldReactQueryDevtools />
                      </QueryClientProviderComponent>
                    </QueryClientProvider>
                  </AuthProvider>
                </SnackbarProvider>
              </ThemeProvider>
            </EmotionProvider>
          </OnlineStatusProvider>
        </PersistGate>
      </LocalizationProvider>
    </Provider>
  );
};

export default DefaultProviders;
