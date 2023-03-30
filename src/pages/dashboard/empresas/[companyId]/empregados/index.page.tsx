import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { EmployeesTable } from 'components/organisms/tables/EmployeesTable/EmployeesTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const EmployeesPage: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Funcionários'} />
      <SContainer>
        <EmployeesTable query={{ all: true }} />
      </SContainer>
    </>
  );
};

export default EmployeesPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
