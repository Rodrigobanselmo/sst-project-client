import { Wizard } from 'react-use-wizard';

import { SContainer } from 'components/atoms/SContainer';
import SWizardBox from 'components/atoms/SWizardBox';
import WizardTabs from 'components/organisms/main/Wizard/components/WizardTabs/WizardTabs';
import { ModalAddAccessGroup } from 'components/organisms/modals/ModalAddAccessGroup';
import { ModalAddUsers } from 'components/organisms/modals/ModalAddUsers';
import { ModalSelectAccessGroups } from 'components/organisms/modals/ModalSelectAccessGroup';
import { AccessGroupsTable } from 'components/organisms/tables/AccessGroupsTable';
import { UsersTable } from 'components/organisms/tables/UsersTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Team: NextPage = () => {
  return (
    <SContainer>
      <Wizard
        header={
          <WizardTabs
            shadow
            options={[{ label: 'Usuários' }, { label: 'Grupo de Permissões' }]}
          />
        }
      >
        <SWizardBox sx={{ px: 5, py: 10 }}>
          <UsersTable />
        </SWizardBox>
        <SWizardBox sx={{ px: 5, py: 10 }}>
          <AccessGroupsTable />
        </SWizardBox>
      </Wizard>
      <ModalAddUsers />
      <ModalSelectAccessGroups />
      <ModalAddAccessGroup />
    </SContainer>
  );
};

export default Team;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
