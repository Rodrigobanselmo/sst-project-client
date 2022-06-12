import { SContainer } from 'components/atoms/SContainer';
import { ModalUploadPhoto } from 'components/organisms/modals/ModalUploadPhoto';
import { EnvironmentTable } from 'components/organisms/tables/EnvironmentTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Companies: NextPage = () => {
  return (
    <SContainer>
      <EnvironmentTable />
      <ModalUploadPhoto />
    </SContainer>
  );
};

export default Companies;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
