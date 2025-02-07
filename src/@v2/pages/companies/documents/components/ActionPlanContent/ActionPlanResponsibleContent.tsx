import { STabsAllWorkspace } from '@v2/components/organisms/STabs/components/STabsAllWorkspace/STabsAllWorkspace';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ActionPlanTable } from '../ActionPlanTable/ActionPlanTable';
import { useAuth } from 'core/contexts/AuthContext';

export const ActionPlanResponsibleContent = ({
  companyId,
}: {
  companyId: string;
}) => {
  const { user } = useAuth();
  const { queryParams, setQueryParams } = useQueryParamsState<{
    tabWorkspaceId?: string;
    tabTableIndex?: number;
  }>();

  return (
    <STabsAllWorkspace
      onChange={(id) => setQueryParams({ tabWorkspaceId: id })}
      workspaceId={queryParams.tabWorkspaceId}
      companyId={companyId}
    >
      <ActionPlanTable
        companyId={companyId}
        userId={user?.id}
        disabledResponisble={true}
        workspaceId={queryParams.tabWorkspaceId}
      />
    </STabsAllWorkspace>
  );
};
