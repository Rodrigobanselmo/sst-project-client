import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { STabsAllWorkspace } from '@v2/components/organisms/STabs/components/STabsAllWorkspace/STabsAllWorkspace';
import { STabs } from '@v2/components/organisms/STabs/STabs';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ActionPlanInfo } from '@v2/pages/companies/action-plan/components/ActionPlanInfo/ActionPlanInfo';
import { ActionPlanTable } from '@v2/pages/companies/action-plan/components/ActionPlanTable/ActionPlanTable';
import { useRouter } from 'next/router';
import { CommentsTable } from './components/CommentsTable/CommentsTable';

export const ActionPlanPage = () => {
  const router = useRouter();
  const { queryParams, setQueryParams } = useQueryParamsState<{
    tabWorkspaceId?: string;
    tabTableIndex?: number;
  }>();

  const companyId = router.query.companyId as string;
  const workspaceId = queryParams.tabWorkspaceId;
  const tabTableIndex = queryParams.tabTableIndex || 1;

  return (
    <>
      <SHeaderTag title={'Plano de Ação'} />
      <SContainer>
        <SPageHeader mb={8} title="Plano de Ação" />
        <STabsAllWorkspace
          onChange={(id) => setQueryParams({ tabWorkspaceId: id })}
          workspaceId={queryParams.tabWorkspaceId}
          companyId={companyId}
        >
          {workspaceId && (
            <ActionPlanInfo
              mb={[14]}
              companyId={companyId}
              workspaceId={workspaceId}
            />
          )}
          <STabs
            value={tabTableIndex}
            onChange={(_, value) =>
              setQueryParams(
                { tabTableIndex: value, tabWorkspaceId: workspaceId },
                { reset: true },
              )
            }
            shadow
            boxProps={{ mb: 10 }}
            options={[
              { label: 'Plano de ação', value: 1 },
              { label: 'Revisão e Aprovação', value: 2 },
            ]}
          />
          {tabTableIndex === 1 && (
            <ActionPlanTable workspaceId={queryParams.tabWorkspaceId} />
          )}
          {tabTableIndex === 2 && (
            <CommentsTable workspaceId={queryParams.tabWorkspaceId} />
          )}
        </STabsAllWorkspace>
      </SContainer>
    </>
  );
};
