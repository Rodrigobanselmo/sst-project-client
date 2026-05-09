import { Wizard } from 'react-use-wizard';
import { useRouter } from 'next/router';

import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SWizardBox from 'components/atoms/SWizardBox';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { StackModalAddRisk } from 'components/organisms/modals/ModalAddRisk';
import { RiskCompanyTable } from 'components/organisms/tables/RiskCompanyTable/RiskCompanyTable';
import { RisksTable } from 'components/organisms/tables/RisksTable/RisksTable';
import { NextPage } from 'next';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { RoutesEnum } from 'core/enums/routes.enums';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskPage: NextPage = () => {
  const router = useRouter();
  const companyId = router.query.companyId as string;

  const handleEditRisk = (risk: IRiskFactors) => {
    router.push(
      RoutesEnum.RISK_EDIT.replace(/:companyId/g, companyId).replace(
        /:riskId/g,
        risk.id,
      ),
    );
  };

  return (
    <>
      <SHeaderTag title={'Riscos'} />
      <SContainer>
        <Wizard
          header={
            <WizardTabs
              shadow
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
  return {
    props: {},
  };
});
