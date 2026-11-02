import React, { FC } from 'react';

import { LoadingFeedback } from 'layouts/default/loading';
import { useRouter } from 'next/router';

import { Sidebar } from '../../components/organisms/main/Sidebar';
import { SidebarDrawerProvider } from '../../core/contexts/SidebarContext';
import { RoutesEnum } from '../../core/enums/routes.enums';
import { DashboardLoadingFeedback } from './loading';
import { STBoxContent, STBoxSidebar, STGridBox, STBoxAIChat } from './styles';
import { KBarRegisterDashboard } from 'layouts/default/KBar/KBarProvider';
import { AIChatSidebar, useAIChat } from '@v2/features/ai-chat';
import { useAuth } from 'core/contexts/AuthContext';

const DashboardLayoutContent: FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const { asPath } = useRouter();
  const { isOpen, panelWidth } = useAIChat();
  const { user } = useAuth();
  const isAIChatEnabled = true;

  if (
    !user &&
    (asPath.includes(RoutesEnum.DASHBOARD) ||
      asPath.includes(RoutesEnum.ONBOARD))
  )
    return <LoadingFeedback />;

  if (asPath.includes(RoutesEnum.ONBOARD))
    return (
      <>
        <SidebarDrawerProvider>
          <STGridBox>
            <div />
            <STBoxContent>
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
        <STGridBox
          ai_chat_width={isAIChatEnabled && isOpen ? panelWidth + 5 : 0}
        >
          <STBoxSidebar>
            <Sidebar />
          </STBoxSidebar>
          <STBoxContent>
            <DashboardLoadingFeedback>{children}</DashboardLoadingFeedback>
          </STBoxContent>
          {isAIChatEnabled && (
            <STBoxAIChat>
              <AIChatSidebar />
            </STBoxAIChat>
          )}
        </STGridBox>
      </SidebarDrawerProvider>
    </>
  );
};

export const DashboardLayout: FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
};
