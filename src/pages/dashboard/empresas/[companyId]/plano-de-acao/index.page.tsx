import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';

import { SPageHeader } from '@v2/components/molecules/SPageHeader/SPageHeader';
import { STabsAllWorkspace } from '@v2/components/organisms/STabs/components/STabsAllWorkspace/STabsAllWorkspace';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ActionPlanInfo } from '@v2/pages/companies/action-plan/components/ActionPlanInfo/ActionPlanInfo';
import { ActionPlanTable } from '@v2/pages/companies/action-plan/components/ActionPlanTable/ActionPlanTable';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { useRouter } from 'next/router';

const ActionPlanPage: NextPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;

  const { queryParams, setQueryParams } = useQueryParamsState<{
    tabWorkspaceId?: string;
  }>();

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
          <ActionPlanInfo
            mb={[14]}
            companyId={companyId}
            workspaceId={queryParams.tabWorkspaceId}
          />
          <ActionPlanTable workspaceId={queryParams.tabWorkspaceId} />
        </STabsAllWorkspace>
      </SContainer>
    </>
  );
};

export default ActionPlanPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
