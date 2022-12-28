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
import { Icon, ThemeProvider } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import { SnackbarKey, SnackbarProvider } from 'notistack';
import { PersistGate } from 'redux-persist/integration/react';

import SCloseIcon from 'assets/icons/SCloseIcon';

import { OnlineStatusProvider } from 'core/hooks/useOnlineStatus';

import theme from '../../../configs/theme';
import { AuthProvider } from '../../../core/contexts/AuthContext';
import { queryClient } from '../../../core/services/queryClient';
import store, { persistor } from '../../../store';

const DefaultProviders: FC = ({ children }) => {
  const notistackRef = React.createRef<SnackbarProvider>();
  const onClickDismiss = (key: SnackbarKey) => () => {
    if (notistackRef.current) notistackRef.current?.closeSnackbar(key);
  };

  return (
    <Provider store={store}>
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
                    {children}
                    <ReactQueryDevtools />
                  </QueryClientProvider>
                </AuthProvider>
              </SnackbarProvider>
            </ThemeProvider>
          </EmotionProvider>
        </OnlineStatusProvider>
      </PersistGate>
    </Provider>
  );
};

export default DefaultProviders;
