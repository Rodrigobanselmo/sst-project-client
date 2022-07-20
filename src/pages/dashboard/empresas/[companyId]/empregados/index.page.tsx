import { SContainer } from 'components/atoms/SContainer';
import { EmployeesTable } from 'components/organisms/tables/EmployeesTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const EmployeesPage: NextPage = () => {
  return (
    <SContainer>
      <EmployeesTable />
    </SContainer>
  );
};

export default EmployeesPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
