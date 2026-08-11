import { Wizard } from 'react-use-wizard';
import { useRouter } from 'next/router';

import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SWizardBox from 'components/atoms/SWizardBox';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { StackModalAddRisk } from 'components/organisms/modals/ModalAddRisk';
import { RiskCompanyTable } from 'components/organisms/tables/RiskCompanyTable/RiskCompanyTable';
import { RisksTable } from 'components/organisms/tables/RisksTable/RisksTable';
import { pickRisksListQueryFromRouter } from 'components/organisms/tables/RisksTable/risksListQuery.util';
import { NextPage } from 'next';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { RoutesEnum } from 'core/enums/routes.enums';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskPage: NextPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;
  const activeTab = router.query.active
    ? Number(router.query.active)
    : 0;

  const handleEditRisk = (
    risk: IRiskFactors,
    listQueryFromTable?: Record<string, string>,
  ) => {
    const listQuery =
      listQueryFromTable && Object.keys(listQueryFromTable).length
        ? listQueryFromTable
        : pickRisksListQueryFromRouter(router.query);
    void router.push({
      pathname: RoutesEnum.RISK_EDIT.replace(/:companyId/g, companyId).replace(
        /:riskId/g,
        risk.id,
      ),
      query: listQuery,
    });
  };

  if (!router.isReady) {
    return (
      <>
        <SHeaderTag title={'Riscos'} />
        <SContainer>
          <SWizardBox sx={{ px: 5, py: 10 }}>Carregando...</SWizardBox>
        </SContainer>
      </>
    );
  }

  return (
    <>
      <SHeaderTag title={'Riscos'} />
      <SContainer>
        <Wizard
          header={
            <WizardTabs
              shadow
              onUrl
              active={Number.isFinite(activeTab) ? activeTab : 0}
              options={[
                { label: 'Todos os Riscos Cadastrados' },
                { label: 'Riscos Identificados' },
              ]}
            />
          }
        >
          <SWizardBox sx={{ px: 5, py: 10 }}>
            <RisksTable onEditRisk={handleEditRisk} />
          </SWizardBox>
          <SWizardBox sx={{ px: 5, py: 10 }}>
            <RiskCompanyTable />
          </SWizardBox>
        </Wizard>
        <StackModalAddRisk />
      </SContainer>
    </>
  );
};

export default RiskPage;

export const getServerSideProps = withSSRAuth(async () => {
  return { props: {} };
});
