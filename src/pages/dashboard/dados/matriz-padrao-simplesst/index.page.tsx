import { SContainer } from 'components/atoms/SContainer';
import { NextPage } from 'next';

import { SystemRiskMatrixPage } from '@v2/pages/master/system-risk-matrix/SystemRiskMatrixPage';
import { RoleEnum } from 'project/enum/roles.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const SystemRiskMatrixRoute: NextPage = () => {
  return (
    <SContainer>
      <SystemRiskMatrixPage />
    </SContainer>
  );
};

export default SystemRiskMatrixRoute;

export const getServerSideProps = withSSRAuth(async () => ({ props: {} }), {
  roles: [RoleEnum.MASTER],
});
