import React, { FC } from 'react';

import { AppLoading } from 'components/organisms/feedback/AppLoading';
import { useAppSelector } from '../../../core/hooks/useAppSelector';
import { selectRouteLoad } from '../../../store/reducers/routeLoad/routeLoadSlice';
import { STBoxChildren } from './styles';

export const LoadingFeedback: FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const { isLoadingRoute, isFetchingData } = useAppSelector(selectRouteLoad);
  const showOverlay = isLoadingRoute || isFetchingData;

  return (
    <STBoxChildren>
      <AppLoading open={showOverlay} variant="contained" />
      {children}
    </STBoxChildren>
  );
};
