import React, { FC } from 'react';

import { useRouter } from 'next/router';

import { Sidebar } from '../../components/main/Sidebar';
import { SidebarDrawerProvider } from '../../core/contexts/SidebarContext';
import { GridBox, BoxSidebar, BoxContent, BoxChildren } from './styles';

export const DashboardLayout: FC = ({ children }) => {
  const { asPath } = useRouter();

  if (!asPath.includes('dashboard')) return <>{children}</>;

  return (
    <SidebarDrawerProvider>
      <GridBox p={2} pl={0}>
        <BoxSidebar>
          <Sidebar />
        </BoxSidebar>
        <BoxContent borderRadius={3}>
          <BoxChildren>{children}</BoxChildren>
        </BoxContent>
      </GridBox>
    </SidebarDrawerProvider>
  );
};
