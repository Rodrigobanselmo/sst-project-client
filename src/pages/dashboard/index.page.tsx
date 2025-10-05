import { SContainer } from 'components/atoms/SContainer';
import SPageTitle from 'components/atoms/SPageTitle';
import { NextPage } from 'next';

import { usePermissionsAccess } from '@v2/hooks/usePermissionsAccess';
import { ActionPlanContent } from '@v2/pages/companies/action-plan/components/ActionPlanContent/ActionPlanContent';
import { ActionPlanResponsibleContent } from '@v2/pages/companies/action-plan/components/ActionPlanContent/ActionPlanResponsibleContent';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { CompaniesWizard } from './empresas/index.page';

const Home: NextPage = () => {
  const { isActionPlanResponsible, isMasterAdmin } = usePermissionsAccess();
  const { data: company } = useQueryCompany();

  if (!company.id) return null;

  if (isMasterAdmin || company.isConsulting) {
    return (
      <>
        <SHeaderTag title={'Empresas'} />
        <SContainer>
          <CompaniesWizard />
        </SContainer>
      </>
    );
  }

  if (isActionPlanResponsible)
    return (
      <>
        <SHeaderTag title={'Plano de Ação'} />
        <SContainer>
          <SPageTitle>Plano de Ação</SPageTitle>
          <ActionPlanResponsibleContent companyId={company.id} />
        </SContainer>
      </>
    );

  return (
    <>
      <SHeaderTag title={'Plano de Ação'} />
      <SContainer>
        <SPageTitle>Plano de Ação</SPageTitle>
        <ActionPlanContent companyId={company.id} />
      </SContainer>
    </>
  );
};

export default Home;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
