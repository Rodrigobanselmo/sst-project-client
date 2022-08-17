import { Wizard } from 'react-use-wizard';

import { Box } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
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
      <Box
        sx={{
          backgroundColor: 'background.default',
          borderRadius: '10px 10px 10px 10px',
          boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
        }}
      >
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
      </Box>
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
