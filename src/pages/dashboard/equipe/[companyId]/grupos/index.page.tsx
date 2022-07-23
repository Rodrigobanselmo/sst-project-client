import { SContainer } from 'components/atoms/SContainer';
import { ModalAddAccessGroup } from 'components/organisms/modals/ModalAddAccessGroup';
import { AccessGroupsTable } from 'components/organisms/tables/AccessGroupsTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const AccessGroup: NextPage = () => {
  return (
    <SContainer>
      <AccessGroupsTable />
      <ModalAddAccessGroup />
    </SContainer>
  );
};

export default AccessGroup;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
