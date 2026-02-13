import React, { FC } from 'react';

import { CircularProgress } from '@mui/material';
import { Header } from 'components/organisms/main/Header';

import { useAuth } from '../../../core/contexts/AuthContext';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import { selectRouteLoad } from '../../../store/reducers/routeLoad/routeLoadSlice';
import { useFetchVisualIdentity } from '@v2/services/enterprise/visual-identity/read-visual-identity/hooks/useFetchVisualIdentity';
import {
  STBoxChildren,
  STLoadLogoSimpleIcon,
  STCompanyLogoLoading,
  STBoxLoading,
  SlideUp,
} from './styles';

export const DashboardLoadingFeedback: FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const { isLoadingRoute, isFetchingData } = useAppSelector(selectRouteLoad);
  const { user } = useAuth();
  const { visualIdentity, isLoading: isLoadingVisualIdentity } =
    useFetchVisualIdentity({
      companyId: user?.companyId || '',
    });

  // Prioriza customLogoUrl, depois logoUrl
  const companyLogo =
    visualIdentity?.visualIdentityEnabled &&
    (visualIdentity?.customLogoUrl || visualIdentity?.logoUrl);

  const renderLoadingLogo = () => {
    // Se ainda está carregando a identidade visual, mostra spinner
    if (isLoadingVisualIdentity) {
      return (
        <CircularProgress
          size={60}
          sx={{
            position: 'fixed',
            right: 'calc(50% - 30px)',
            top: 'calc(50% - 50px)',
            color: 'primary.main',
          }}
        />
      );
    }

    // Se tem logo da empresa, mostra o logo
    if (companyLogo) {
      return (
        <STCompanyLogoLoading
          src={visualIdentity.customLogoUrl || visualIdentity.logoUrl!}
          alt={visualIdentity.shortName || 'Logo'}
        />
      );
    }

    // Fallback para o logo padrão
    return <STLoadLogoSimpleIcon />;
  };

  return (
    <STBoxChildren>
      <Header />
      {(isLoadingRoute || isFetchingData) && (
        <STBoxLoading>{renderLoadingLogo()}</STBoxLoading>
      )}
      {children}
    </STBoxChildren>
  );
};
