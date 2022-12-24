import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { ModalAddAccessGroup } from 'components/organisms/modals/ModalAddAccessGroup';
import { AccessGroupsTable } from 'components/organisms/tables/AccessGroupsTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const AccessGroup: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Grupo Acesso'} />
      <SContainer>
        <AccessGroupsTable />
        <ModalAddAccessGroup />
      </SContainer>
    </>
  );
};

export default AccessGroup;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
