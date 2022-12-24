import { Wizard } from 'react-use-wizard';

import { Box } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SWizardBox from 'components/atoms/SWizardBox';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ModalAddExam } from 'components/organisms/modals/ModalAddExam/ModalAddExam';
import { StackModalAddRisk } from 'components/organisms/modals/ModalAddRisk';
import { ModalEditExamRisk } from 'components/organisms/modals/ModalEditExamRisk/ModalEditExamRisk';
import { ExamsRiskTable } from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTable';
import { ExamsTable } from 'components/organisms/tables/ExamsTable/ExamsTable';
import { RiskCompanyTable } from 'components/organisms/tables/RiskCompanyTable/RiskCompanyTable';
import { RisksTable } from 'components/organisms/tables/RisksTable/RisksTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskPage: NextPage = () => {
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
            <RisksTable />
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
