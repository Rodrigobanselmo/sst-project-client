import { SContainer } from 'components/atoms/SContainer';
import SPageTitle from 'components/atoms/SPageTitle';
import { NextPage } from 'next';

import { usePermissionsAccess } from '@v2/hooks/usePermissionsAccess';
import { ActionPlanResponsibleContent } from '@v2/pages/companies/action-plan/components/ActionPlanContent/ActionPlanResponsibleContent';
import { AbsenteeismContent } from '@v2/pages/companies/absenteeisms/components/AbsenteeismContent/AbsenteeismContent';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { CompaniesWizard } from './empresas/index.page';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Home: NextPage = () => {
  const { isActionPlanResponsible, isMasterAdmin, isAbsenteeismOnly } =
    usePermissionsAccess();
  const { data: company } = useQueryCompany();
  const router = useRouter();

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

  if (isAbsenteeismOnly)
    return (
      <>
        <SHeaderTag title={'Absenteísmo'} />
        <SContainer>
          <SPageTitle>Absenteísmo</SPageTitle>
          <AbsenteeismContent companyId={company.id} />
        </SContainer>
      </>
    );

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

  // V2: o dashboard não é "home operacional" para empresa normal.
  // Mantemos perfis restritos (absenteísmo-only / responsável PA) nas suas landings,
  // e direcionamos o restante para a tela principal da empresa.
  useEffect(() => {
    const target = RoutesEnum.COMPANY.replace(':companyId', company.id).replace(
      ':stage',
      '0',
    );
    if (router.asPath !== target) void router.replace(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company.id]);

  return null;
};

export default Home;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
