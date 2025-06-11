import { STabsAllWorkspace } from '@v2/components/organisms/STabs/Implementations/STabsAllWorkspace/STabsAllWorkspace';
import { STabs } from '@v2/components/organisms/STabs/STabs';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ActionPlanInfo } from '@v2/pages/companies/action-plan/components/ActionPlanInfo/ActionPlanInfo';
import { ActionPlanTable } from '@v2/pages/companies/action-plan/components/ActionPlanTable/ActionPlanTable';
import { CommentsTable } from '../CommentsTable/CommentsTable';
import { StackModalViewUsers } from 'components/organisms/modals/ModalPdfView/ModalPdfView';

export const ActionPlanContent = ({ companyId }: { companyId: string }) => {
  const { queryParams, setQueryParams } = useQueryParamsState<{
    tabWorkspaceId?: string;
    tabTableIndex?: number;
  }>();

  const workspaceId = queryParams.tabWorkspaceId;
  const tabTableIndex = queryParams.tabTableIndex || 1;

  return (
    <>
      {/* -//! remove need to change to new format, refactor users table */}
      <StackModalViewUsers />
      {/* -//! remove */}
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
          loading={!queryParams.tabWorkspaceId}
          onChange={(_, value) =>
            setQueryParams(
              { tabTableIndex: value, tabWorkspaceId: workspaceId },
              { reset: true },
            )
          }
          shadow
          options={[
            {
              label: 'Plano de ação',
              value: 1,
              component: queryParams.tabWorkspaceId ? (
                <ActionPlanTable
                  companyId={companyId}
                  workspaceId={queryParams.tabWorkspaceId}
                />
              ) : null,
            },
            {
              label: 'Revisão e Aprovação',
              value: 2,
              component: (
                <CommentsTable
                  companyId={companyId}
                  workspaceId={queryParams.tabWorkspaceId}
                />
              ),
            },
          ]}
        />
      </STabsAllWorkspace>
    </>
  );
};
