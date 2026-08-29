import React, { FC } from 'react';

import { Box } from '@mui/material';
import { Header } from 'components/organisms/main/Header';
import { AppLoading } from 'components/organisms/feedback/AppLoading';

import { useAppSelector } from '../../../core/hooks/useAppSelector';
import { selectRouteLoad } from '../../../store/reducers/routeLoad/routeLoadSlice';
import { STBoxChildren } from './styles';

export const DashboardLoadingFeedback: FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const { isLoadingRoute, isFetchingData } = useAppSelector(selectRouteLoad);
  const showOverlay = isLoadingRoute || isFetchingData;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Header />
      <STBoxChildren>
        <AppLoading open={showOverlay} variant="contained" />
        {children}
      </STBoxChildren>
    </Box>
  );
};
