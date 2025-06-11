import { STabsAllWorkspace } from '@v2/components/organisms/STabs/Implementations/STabsAllWorkspace/STabsAllWorkspace';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { useAuth } from 'core/contexts/AuthContext';
import { ActionPlanTable } from '../ActionPlanTable/ActionPlanTable';

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
    <>
      <STabsAllWorkspace
        onChange={(id) => setQueryParams({ tabWorkspaceId: id })}
        workspaceId={queryParams.tabWorkspaceId}
        companyId={companyId}
      >
        {queryParams.tabWorkspaceId && (
          <ActionPlanTable
            companyId={companyId}
            userId={user?.id}
            disabledResponsible={true}
            workspaceId={queryParams.tabWorkspaceId}
          />
        )}
      </STabsAllWorkspace>
    </>
  );
};
