import React, { ReactNode } from 'react';

import { useAuth } from 'core/contexts/AuthContext';
import { useFetchVisualIdentity } from '@v2/services/enterprise/visual-identity/read-visual-identity/hooks/useFetchVisualIdentity';

interface GlobalLoadingScreenProps {
  children: ReactNode;
}

const spinnerStyles: React.CSSProperties = {
  width: 48,
  height: 48,
  border: '4px solid #e0e0e0',
  borderTopColor: '#1976d2',
  borderRadius: '50%',
  animation: 'global-spinner-spin 1s linear infinite',
};

const containerStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#fff',
  zIndex: 99999,
};

/**
 * Global loading screen that blocks the entire app until visual identity is loaded.
 * Only blocks when the authenticated user is known — never on token-without-user
 * (logout race, invite signup, or session bootstrap).
 */
export const GlobalLoadingScreen = ({ children }: GlobalLoadingScreenProps) => {
  const { user, isInitializingAuth } = useAuth();
  const { isLoading: isLoadingVisualIdentity } = useFetchVisualIdentity({
    companyId: user?.companyId || '',
  });

  const showBootstrapLoader = isInitializingAuth;
  const showVisualIdentityLoader =
    !!user?.id && !!user.companyId && isLoadingVisualIdentity;

  if (showBootstrapLoader || showVisualIdentityLoader) {
    return (
      <div style={containerStyles}>
        <style>
          {
            '@keyframes global-spinner-spin { to { transform: rotate(360deg); } }'
          }
        </style>
        <div style={spinnerStyles} />
      </div>
    );
  }

  return <>{children}</>;
};
