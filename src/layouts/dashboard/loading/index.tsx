import React, { FC } from 'react';

import { useAppSelector } from '../../../core/hooks/useAppSelector';
import { selectRouteLoad } from '../../../store/reducers/routeLoad/routeLoadSlice';
import { STBoxChildren, STLoadLogoSimpleIcon } from './styles';

export const DashboardLoadingFeedback: FC = ({ children }) => {
  const { isLoadingRoute, isFetchingData } = useAppSelector(selectRouteLoad);
  return (
    <STBoxChildren>
      {isLoadingRoute || isFetchingData ? <STLoadLogoSimpleIcon /> : children}
    </STBoxChildren>
  );
};
