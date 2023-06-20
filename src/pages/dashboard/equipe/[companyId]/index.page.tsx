import { Wizard } from 'react-use-wizard';

import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import SWizardBox from 'components/atoms/SWizardBox';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ModalAddAccessGroup } from 'components/organisms/modals/ModalAddAccessGroup';
import { ModalAddUsers } from 'components/organisms/modals/ModalAddUsers';
import { ModalSelectAccessGroups } from 'components/organisms/modals/ModalSelectAccessGroup';
import { AccessGroupsTable } from 'components/organisms/tables/AccessGroupsTable';
import { UsersTable } from 'components/organisms/tables/UsersTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { UsersHistorysTable } from 'components/organisms/tables/UsersHistoryTable';

const Team: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Usuários'} />
      <SContainer>
        <Wizard
          header={
            <WizardTabs
              shadow
              options={[
                { label: 'Usuários' },
                { label: 'Grupo de Permissões' },
                { label: 'Histórico de login' },
              ]}
            />
          }
        >
          <SWizardBox sx={{ px: 5, py: 10 }}>
            <UsersTable />
          </SWizardBox>
          <SWizardBox sx={{ px: 5, py: 10 }}>
            <AccessGroupsTable />
          </SWizardBox>
          <SWizardBox sx={{ px: 5, py: 10 }}>
            <UsersHistorysTable />
          </SWizardBox>
        </Wizard>
        <ModalAddUsers />
        <ModalSelectAccessGroups />
        <ModalAddAccessGroup />
      </SContainer>
    </>
  );
};

export default Team;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
