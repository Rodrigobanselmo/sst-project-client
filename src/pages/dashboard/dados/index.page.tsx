import { SContainer } from 'components/atoms/SContainer';
import { DatabaseTable } from 'components/organisms/tables/DatabaseTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Database: NextPage = () => {
  return (
    <SContainer>
      <DatabaseTable />
    </SContainer>
  );
};

export default Database;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
