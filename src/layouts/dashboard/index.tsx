import React, { FC } from 'react';

import { useRouter } from 'next/router';

import { Header } from '../../components/main/Header';
import { Sidebar } from '../../components/main/Sidebar';
import { SidebarDrawerProvider } from '../../core/contexts/SidebarContext';
import { DashboardLoadingFeedback } from './loading';
import { STBoxContent, STBoxSidebar, STGridBox } from './styles';

export const DashboardLayout: FC = ({ children }) => {
  const { asPath } = useRouter();

  if (!asPath.includes('dashboard')) return <>{children}</>;

  return (
    <SidebarDrawerProvider>
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
