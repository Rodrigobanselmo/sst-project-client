import { SContainer } from 'components/atoms/SContainer';
import { NextPage } from 'next';

import { ESocialTable27ListPage } from '@v2/pages/master/esocial-table-27/ESocialTable27ListPage';
import { RoleEnum } from 'project/enum/roles.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const ESocialTable27Route: NextPage = () => {
  return (
    <SContainer>
      <ESocialTable27ListPage />
    </SContainer>
  );
};

export default ESocialTable27Route;

export const getServerSideProps = withSSRAuth(async () => ({ props: {} }), {
  roles: [RoleEnum.MASTER],
});
