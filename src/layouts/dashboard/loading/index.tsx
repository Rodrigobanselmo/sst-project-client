import React, { FC } from 'react';

import { Header } from 'components/organisms/main/Header';

import { useAppSelector } from '../../../core/hooks/useAppSelector';
import { selectRouteLoad } from '../../../store/reducers/routeLoad/routeLoadSlice';
import { STBoxChildren, STLoadLogoSimpleIcon, STBoxLoading } from './styles';

export const DashboardLoadingFeedback: FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const { isLoadingRoute, isFetchingData } = useAppSelector(selectRouteLoad);
  return (
    <STBoxChildren>
      <Header />
      {(isLoadingRoute || isFetchingData) && (
        <STBoxLoading>
          <STLoadLogoSimpleIcon />
        </STBoxLoading>
      )}
      {children}
    </STBoxChildren>
  );
};
