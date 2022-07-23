import { SContainer } from 'components/atoms/SContainer';
import { ModalEditCompany } from 'components/organisms/modals/company/ModalEditCompany';
import { ModalAddAccessGroup } from 'components/organisms/modals/ModalAddAccessGroup';
import { ModalAddUsers } from 'components/organisms/modals/ModalAddUsers';
import { ModalSelectAccessGroups } from 'components/organisms/modals/ModalSelectAccessGroup';
import { ModalSelectCompany } from 'components/organisms/modals/ModalSelectCompany';
import { ModalUploadPhoto } from 'components/organisms/modals/ModalUploadPhoto';
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
      <ModalEditCompany />
      <ModalUploadPhoto />
    </SContainer>
  );
};

export default Team;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
