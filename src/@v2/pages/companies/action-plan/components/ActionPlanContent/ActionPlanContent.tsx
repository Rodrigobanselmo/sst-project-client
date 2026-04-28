import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { STabs } from '@v2/components/organisms/STabs/STabs';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { ActionPlanInfo } from '@v2/pages/companies/action-plan/components/ActionPlanInfo/ActionPlanInfo';
import { ActionPlanTable } from '@v2/pages/companies/action-plan/components/ActionPlanTable/ActionPlanTable';
import { useEffect, useMemo } from 'react';
import { CommentsTable } from '../CommentsTable/CommentsTable';
import { StackModalViewUsers } from 'components/organisms/modals/ModalPdfView/ModalPdfView';

export const ActionPlanContent = ({ companyId }: { companyId: string }) => {
  const { queryParams, setQueryParams } = useQueryParamsState<{
    tabWorkspaceId?: string;
    tabTableIndex?: number;
  }>();

  const workspaceId = queryParams.tabWorkspaceId;
  const tabTableIndex = queryParams.tabTableIndex || 1;
  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId,
  });

  const sortedFirstId = useMemo(() => {
    if (!workspaces?.results?.length) return undefined;
    return [...workspaces.results]
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }))
      [0]?.id;
  }, [workspaces?.results]);

  useEffect(() => {
    if (!sortedFirstId || workspaceId) return;
    setQueryParams({ tabWorkspaceId: sortedFirstId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedFirstId, workspaceId]);

  if (isLoadingAllWorkspaces) return <SSkeleton height={500} />;

  if (!workspaces?.results?.length) {
    return (
      <SFlex flex={1} center py={8} bgcolor="grey.100" borderRadius={1}>
        <SText>Cadastre um estabelecimento antes</SText>
      </SFlex>
    );
  }

  return (
    <>
      {/* -//! remove need to change to new format, refactor users table */}
      <StackModalViewUsers />
      {/* -//! remove */}
      {workspaceId && (
        <ActionPlanInfo mb={[14]} companyId={companyId} workspaceId={workspaceId} />
      )}
      <STabs
        value={tabTableIndex}
        loading={!workspaceId}
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
            component: workspaceId ? (
              <ActionPlanTable companyId={companyId} workspaceId={workspaceId} />
            ) : null,
          },
          {
            label: 'Revisão e Aprovação',
            value: 2,
            component: (
              <CommentsTable companyId={companyId} workspaceId={workspaceId} />
            ),
          },
        ]}
      />
    </>
  );
};
