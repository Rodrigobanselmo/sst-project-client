import { Wizard } from 'react-use-wizard';

import { Box } from '@mui/material';
import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SWizardBox from 'components/atoms/SWizardBox';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { StackModalAddRisk } from 'components/organisms/modals/ModalAddRisk';
import { RiskCompanyTable } from 'components/organisms/tables/RiskCompanyTable/RiskCompanyTable';
import { RiskInlineEditor } from 'components/organisms/tables/RisksTable/RiskInlineEditor';
import { RisksTable } from 'components/organisms/tables/RisksTable/RisksTable';
import { NextPage } from 'next';
import { useState } from 'react';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskPage: NextPage = () => {
  const [editingRisk, setEditingRisk] = useState<IRiskFactors | null>(null);

  return (
    <>
      <SHeaderTag title={'Riscos'} />
      <SContainer>
        {editingRisk ? (
          <Box sx={{ px: 5, py: 10 }}>
            <RiskInlineEditor
              risk={editingRisk}
              onBackToList={() => setEditingRisk(null)}
            />
          </Box>
        ) : (
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
              <RisksTable onEditRisk={(risk) => setEditingRisk(risk)} />
            </SWizardBox>
            <SWizardBox sx={{ px: 5, py: 10 }}>
              <RiskCompanyTable />
            </SWizardBox>
          </Wizard>
        )}
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
