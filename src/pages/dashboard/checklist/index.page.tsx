import { SContainer } from 'components/atoms/SContainer';
import { ChecklistTable } from 'components/tables/ChecklistTable';
import { NextPage } from 'next';

import { PermissionEnum } from 'core/enums/permission.enum';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Home: NextPage = () => {
  return (
    <SContainer>
      <ChecklistTable />
    </SContainer>
  );
};

export default Home;

export const getServerSideProps = withSSRAuth(
  async () => {
    return {
      props: {},
    };
  },
  {
    permissions: [PermissionEnum.CREATE_RISK],
  },
);
