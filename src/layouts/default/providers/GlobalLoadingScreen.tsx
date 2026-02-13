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
 * Shows a simple loading spinner, then renders children only when ready.
 * Uses pure CSS/inline styles to avoid any theme dependency.
 */
export const GlobalLoadingScreen = ({ children }: GlobalLoadingScreenProps) => {
  const { user } = useAuth();
  const { isLoading: isLoadingVisualIdentity } = useFetchVisualIdentity({
    companyId: user?.companyId || '',
  });

  // Show loading only if user is logged in and visual identity is loading
  if (isLoadingVisualIdentity || !user?.companyId) {
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
