import React, { ReactNode } from 'react';

import { AppLoading } from 'components/organisms/feedback/AppLoading';
import { useAuth } from 'core/contexts/AuthContext';
import { useResolvedVisualIdentity } from 'core/hooks/useResolvedVisualIdentity';

interface GlobalLoadingScreenProps {
  children: ReactNode;
}

/**
 * Overlay de bootstrap / primeira identidade.
 * Sempre mantém children montados para não derrubar DefaultLayout
 * nem os listeners de navegação. Usa só isLoading, nunca isFetching.
 */
export const GlobalLoadingScreen = ({ children }: GlobalLoadingScreenProps) => {
  const { user, isInitializingAuth } = useAuth();
  const { isLoading: isLoadingVisualIdentity, fetchCompanyId } =
    useResolvedVisualIdentity();

  const showBootstrapLoader = isInitializingAuth;
  const showVisualIdentityLoader =
    !!user?.id && !!fetchCompanyId && isLoadingVisualIdentity;

  const showOverlay = showBootstrapLoader || showVisualIdentityLoader;

  return (
    <>
      {children}
      <AppLoading open={showOverlay} variant="fullscreen" />
    </>
  );
};
