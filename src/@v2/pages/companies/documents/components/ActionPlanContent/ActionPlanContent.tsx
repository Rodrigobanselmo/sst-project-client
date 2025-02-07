import { STabsAllWorkspace } from '@v2/components/organisms/STabs/components/STabsAllWorkspace/STabsAllWorkspace';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { CommentsTable } from '../CommentsTable/CommentsTable';

export const DocumentsContent = ({ companyId }: { companyId: string }) => {
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
        <CommentsTable
          companyId={companyId}
          workspaceId={queryParams.tabWorkspaceId}
        />
      </STabsAllWorkspace>
    </>
  );
};
