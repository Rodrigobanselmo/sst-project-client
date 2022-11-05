import React, { useEffect } from 'react';
import { Wizard } from 'react-use-wizard';

import { Box } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import SWizardBox from 'components/atoms/SWizardBox';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { StackModalRiskTool } from 'components/organisms/modals/ModalRiskTool';
import { RiskCompanyTable } from 'components/organisms/tables/RiskCompanyTable/RiskCompanyTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const EsocialPage: NextPage = () => {
  return (
    <>
      <SContainer>
        <Wizard
          header={
            <WizardTabs
              shadow
              options={[
                { label: 'Controle' },
                { label: 'Eventos' },
                { label: 'Lotes' },
              ]}
            />
          }
        >
          <SWizardBox sx={{ px: 5, py: 10 }}></SWizardBox>
          <SWizardBox sx={{ px: 5, py: 10 }}></SWizardBox>
          <SWizardBox sx={{ px: 5, py: 10 }}></SWizardBox>
        </Wizard>
      </SContainer>
    </>
  );
};

export default EsocialPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
