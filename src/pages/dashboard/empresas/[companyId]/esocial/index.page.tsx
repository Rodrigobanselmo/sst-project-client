import React, { useEffect } from 'react';
import { Wizard } from 'react-use-wizard';

import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import TopicIcon from '@mui/icons-material/Topic';
import { SContainer } from 'components/atoms/SContainer';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import SWizardBox from 'components/atoms/SWizardBox';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ModalSend2220ESocial } from 'components/organisms/modals/ModalSend2220ESocial/ModalSend2220ESocial';
import { ModalSend2240ESocial } from 'components/organisms/modals/ModalSend2240ESocial/ModalSend2240ESocial';
import { CompanyESocialTable } from 'components/organisms/tables/CompanyESocialTable/CompanyESocialTable';
import { ESocialBatchTable } from 'components/organisms/tables/ESocialBatchTable/ESocialBatchTable';
import { ESocialEventTable } from 'components/organisms/tables/ESocialEventTable/ESocialEventTable';
import { NextPage } from 'next';

import SEventIcon from 'assets/icons/SEventIcon/SEventIcon';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const EsocialPage: NextPage = () => {
  return (
    <>
      <SContainer>
        <STableTitle>Eventos eSocial</STableTitle>
        <Wizard
          header={
            <WizardTabs
              shadow
              textColor="secondary"
              indicatorColor="secondary"
              height={60}
              options={[
                {
                  label: 'Geral',
                  icon: <ContentPasteIcon />,
                  iconPosition: 'start',
                },
                {
                  label: 'Eventos',
                  icon: <SEventIcon />,
                  iconPosition: 'start',
                },
                { label: 'Lotes', icon: <TopicIcon />, iconPosition: 'start' },
              ]}
            />
          }
        >
          <CompanyESocialTable />
          <SWizardBox sx={{ px: 5, py: 10 }}>
            <ESocialEventTable />
          </SWizardBox>
          <SWizardBox sx={{ px: 5, py: 10 }}>
            <ESocialBatchTable />
          </SWizardBox>
        </Wizard>
      </SContainer>
      <ModalSend2220ESocial />
      <ModalSend2240ESocial />
    </>
  );
};

export default EsocialPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
