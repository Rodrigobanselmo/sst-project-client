import React, { FC } from 'react';

import { Global } from '@emotion/react';
import { LoadingFeedback } from 'layouts/default/loading';
import { useRouter } from 'next/router';

import { Sidebar } from '../../components/organisms/main/Sidebar';
import { SidebarDrawerProvider } from '../../core/contexts/SidebarContext';
import { RoutesEnum } from '../../core/enums/routes.enums';
import globalStylesDashboard from '../../core/styles/globalStylesDashboard';
import { DashboardLoadingFeedback } from './loading';
import { STBoxContent, STBoxSidebar, STGridBox, STBoxAIChat } from './styles';
import { KBarRegisterDashboard } from 'layouts/default/KBar/KBarProvider';
import { AIChatSidebar, useAIChat } from '@v2/features/ai-chat';

const DashboardLayoutContent: FC<React.PropsWithChildren<any>> = ({
  children,
}) => {
  const { asPath } = useRouter();
  const { isOpen, panelWidth } = useAIChat();
  const isAIChatEnabled = process.env.NEXT_PUBLIC_ENABLE_AI_CHAT === 'true';

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
        <STGridBox
          p={2}
          pl={0}
          ai_chat_width={isAIChatEnabled && isOpen ? panelWidth + 5 : 0}
        >
          <STBoxSidebar>
            <Sidebar />
          </STBoxSidebar>
          <STBoxContent borderRadius={3}>
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
