import React, { FC } from 'react';

import { Global } from '@emotion/react';
import { useRouter } from 'next/router';

import { Header } from '../../components/main/Header';
import { Sidebar } from '../../components/main/Sidebar';
import { SidebarDrawerProvider } from '../../core/contexts/SidebarContext';
import { RoutesEnum } from '../../core/enums/routes.enums';
import globalStylesDashboard from '../../core/styles/globalStylesDashboard';
import { DashboardLoadingFeedback } from './loading';
import { STBoxContent, STBoxSidebar, STGridBox } from './styles';

export const DashboardLayout: FC = ({ children }) => {
  const { asPath } = useRouter();

  if (!asPath.includes(RoutesEnum.DASHBOARD)) return <>{children}</>;

  return (
    <SidebarDrawerProvider>
      <Global styles={globalStylesDashboard} />
      <STGridBox p={2} pl={0}>
        <STBoxSidebar>
          <Sidebar />
        </STBoxSidebar>
        <STBoxContent borderRadius={3}>
          <Header />
          <DashboardLoadingFeedback>{children}</DashboardLoadingFeedback>
        </STBoxContent>
      </STGridBox>
    </SidebarDrawerProvider>
  );
};
