import { SContainer } from 'components/atoms/SContainer';
import { EmployeesTable } from 'components/tables/EmployeesTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const CompanyPage: NextPage = () => {
  return (
    <SContainer>
      <EmployeesTable />
    </SContainer>
  );
};

export default CompanyPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
