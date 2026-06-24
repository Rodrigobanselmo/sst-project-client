import { SContainer } from 'components/atoms/SContainer';
import { NextPage } from 'next';

import { BiologicalIndicatorsListPage } from '@v2/pages/master/biological-indicators/BiologicalIndicatorsListPage';
import { RoleEnum } from 'project/enum/roles.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const BiologicalIndicatorsRoute: NextPage = () => {
  return (
    <SContainer>
      <BiologicalIndicatorsListPage />
    </SContainer>
  );
};

export default BiologicalIndicatorsRoute;

export const getServerSideProps = withSSRAuth(async () => ({ props: {} }), {
  roles: [RoleEnum.MASTER],
});
