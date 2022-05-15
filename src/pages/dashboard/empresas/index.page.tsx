import { SContainer } from 'components/atoms/SContainer';
import { CompaniesTable } from 'components/organisms/tables/CompaniesTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Companies: NextPage = () => {
  return (
    <SContainer>
      <CompaniesTable />
    </SContainer>
  );
};

export default Companies;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
