import React, { FC } from 'react';

import { useAppSelector } from '../../../core/hooks/useAppSelector';
import { selectRouteLoad } from '../../../store/reducers/routeLoad/routeLoadSlice';
import { STBoxChildren, STLoadLogoSimpleIcon, STBoxLoading } from './styles';

export const LoadingFeedback: FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const { isLoadingRoute, isFetchingData } = useAppSelector(selectRouteLoad);
  return (
    <STBoxChildren>
      {(isLoadingRoute || isFetchingData) && (
        <STBoxLoading>
          <STLoadLogoSimpleIcon />
        </STBoxLoading>
      )}
      {children}
    </STBoxChildren>
  );
};
