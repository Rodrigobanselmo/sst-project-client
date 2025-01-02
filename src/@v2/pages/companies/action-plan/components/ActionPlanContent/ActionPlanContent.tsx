import { STabsAllWorkspace } from '@v2/components/organisms/STabs/components/STabsAllWorkspace/STabsAllWorkspace';
import { STabs } from '@v2/components/organisms/STabs/STabs';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ActionPlanInfo } from '@v2/pages/companies/action-plan/components/ActionPlanInfo/ActionPlanInfo';
import { ActionPlanTable } from '@v2/pages/companies/action-plan/components/ActionPlanTable/ActionPlanTable';
import { CommentsTable } from '../CommentsTable/CommentsTable';

export const ActionPlanContent = ({ companyId }: { companyId: string }) => {
  const { queryParams, setQueryParams } = useQueryParamsState<{
    tabWorkspaceId?: string;
    tabTableIndex?: number;
  }>();

  const workspaceId = queryParams.tabWorkspaceId;
  const tabTableIndex = queryParams.tabTableIndex || 1;

  return (
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
        <ActionPlanTable
          companyId={companyId}
          workspaceId={queryParams.tabWorkspaceId}
        />
      )}
      {tabTableIndex === 2 && (
        <CommentsTable
          companyId={companyId}
          workspaceId={queryParams.tabWorkspaceId}
        />
      )}
    </STabsAllWorkspace>
  );
};
