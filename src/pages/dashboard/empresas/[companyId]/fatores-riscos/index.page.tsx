import { Wizard } from 'react-use-wizard';

import { Box } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
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
    <SContainer>
      <Box
        sx={{
          backgroundColor: 'grey.200',
          borderRadius: '10px 10px 10px 10px',
          boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Wizard
          header={
            <WizardTabs
              options={[
                { label: 'Todos os Riscos Cadastrados' },
                { label: 'Riscos Identificados' },
              ]}
            />
          }
        >
          <Box sx={{ px: 5, pb: 10 }}>
            <RisksTable />
          </Box>
          <Box sx={{ px: 5, pb: 10 }}>
            <RiskCompanyTable />
          </Box>
        </Wizard>
      </Box>
      <StackModalAddRisk />
    </SContainer>
  );
};

export default RiskPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
