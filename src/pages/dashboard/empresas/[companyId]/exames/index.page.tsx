import { Wizard } from 'react-use-wizard';

import { Box } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import SWizardBox from 'components/atoms/SWizardBox';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ModalAddExam } from 'components/organisms/modals/ModalAddExam/ModalAddExam';
import { ModalEditExamRisk } from 'components/organisms/modals/ModalEditExamRisk/ModalEditExamRisk';
import { ExamsRiskTable } from 'components/organisms/tables/ExamsRiskTable/ExamsRiskTable';
import { ExamsTable } from 'components/organisms/tables/ExamsTable/ExamsTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const ExamsPage: NextPage = () => {
  return (
    <SContainer>
      <SWizardBox>
        <Wizard
          header={
            <WizardTabs
              options={[
                { label: 'Exames Cadastrados' },
                { label: 'Riscos e Exames' },
              ]}
            />
          }
        >
          <Box sx={{ px: 5, pb: 10 }}>
            <ExamsTable />
          </Box>
          <Box sx={{ px: 5, pb: 10 }}>
            <ExamsRiskTable />
          </Box>
        </Wizard>
      </SWizardBox>
      <ModalAddExam />
      <ModalEditExamRisk />
    </SContainer>
  );
};

export default ExamsPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
