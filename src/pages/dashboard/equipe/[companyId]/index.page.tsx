import { SContainer } from 'components/atoms/SContainer';
import { ModalAddAccessGroup } from 'components/organisms/modals/ModalAddAccessGroup';
import { ModalAddUsers } from 'components/organisms/modals/ModalAddUsers';
import { ModalSelectAccessGroups } from 'components/organisms/modals/ModalSelectAccessGroup';
import { UsersTable } from 'components/organisms/tables/UsersTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Team: NextPage = () => {
  return (
    <SContainer>
      <UsersTable />
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
