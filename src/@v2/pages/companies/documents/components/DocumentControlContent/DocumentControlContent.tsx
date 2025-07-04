import { STabsAllWorkspace } from '@v2/components/organisms/STabs/Implementations/STabsAllWorkspace/STabsAllWorkspace';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { DocumentControlTable } from '../DocumentControlTable/DocumentControlTable';

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
        mb={10}
      >
        {!!queryParams.tabWorkspaceId && (
          <DocumentControlTable
            companyId={companyId}
            workspaceId={queryParams.tabWorkspaceId}
          />
        )}
      </STabsAllWorkspace>
    </>
  );
};
