import React, { FC } from 'react';

import { useAuth } from '../../../core/contexts/AuthContext';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import { selectRouteLoad } from '../../../store/reducers/routeLoad/routeLoadSlice';
import { useFetchVisualIdentity } from '@v2/services/enterprise/visual-identity/read-visual-identity/hooks/useFetchVisualIdentity';
import { resolveSidebarLogo } from 'core/utils/company/resolve-visual-identity-logo';
import {
  STBoxChildren,
  STLoadLogoSimpleIcon,
  STCompanyLogoLoading,
  STBoxLoading,
} from './styles';

export const LoadingFeedback: FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const { isLoadingRoute, isFetchingData } = useAppSelector(selectRouteLoad);
  const { user } = useAuth();
  const { visualIdentity } = useFetchVisualIdentity({
    companyId: user?.companyId || '',
  });
  const companyLogo = resolveSidebarLogo(visualIdentity);

  const renderLoadingLogo = () => {
    if (companyLogo) {
      return (
        <STCompanyLogoLoading
          src={companyLogo!}
          alt={visualIdentity?.shortName || 'Logo'}
        />
      );
    }

    return <STLoadLogoSimpleIcon />;
  };

  return (
    <STBoxChildren>
      {(isLoadingRoute || isFetchingData) && (
        <STBoxLoading>{renderLoadingLogo()}</STBoxLoading>
      )}
      {children}
    </STBoxChildren>
  );
};
