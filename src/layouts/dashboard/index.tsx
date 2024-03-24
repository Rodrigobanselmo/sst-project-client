import React, { FC } from 'react';

import { Global } from '@emotion/react';
import { LoadingFeedback } from 'layouts/default/loading';
import { useRouter } from 'next/router';

import { Sidebar } from '../../components/organisms/main/Sidebar';
import { SidebarDrawerProvider } from '../../core/contexts/SidebarContext';
import { RoutesEnum } from '../../core/enums/routes.enums';
import globalStylesDashboard from '../../core/styles/globalStylesDashboard';
import { DashboardLoadingFeedback } from './loading';
import { STBoxContent, STBoxSidebar, STGridBox } from './styles';
import { KBarProvider } from 'kbar';
import { KBarRegisterDashboard } from 'layouts/default/KBar/KBarProvider';

export const DashboardLayout: FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const { asPath } = useRouter();

  if (asPath.includes(RoutesEnum.ONBOARD))
    return (
      <>
        <SidebarDrawerProvider>
          <Global styles={globalStylesDashboard} />
          <STGridBox p={2} pl={0}>
            <div />
            <STBoxContent borderRadius={3}>
              <DashboardLoadingFeedback>{children}</DashboardLoadingFeedback>
            </STBoxContent>
          </STGridBox>
        </SidebarDrawerProvider>
      </>
    );

  if (!asPath.includes(RoutesEnum.DASHBOARD))
    return <LoadingFeedback>{children}</LoadingFeedback>;

  return (
    <>
      <KBarRegisterDashboard />
      <SidebarDrawerProvider>
        <Global styles={globalStylesDashboard} />
        <STGridBox p={2} pl={0}>
          <STBoxSidebar>
            <Sidebar />
          </STBoxSidebar>
          <STBoxContent borderRadius={3}>
            <DashboardLoadingFeedback>{children}</DashboardLoadingFeedback>
          </STBoxContent>
        </STGridBox>
      </SidebarDrawerProvider>
    </>
  );
};
