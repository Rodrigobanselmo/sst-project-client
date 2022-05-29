import { SContainer } from 'components/atoms/SContainer';
import SPageTitle from 'components/atoms/SPageTitle';
import { UsersTable } from 'components/organisms/tables/UsersTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Team: NextPage = () => {
  return (
    <SContainer>
      <UsersTable />
    </SContainer>
  );
};

export default Team;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
