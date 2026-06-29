import { SContainer } from 'components/atoms/SContainer';
import { NextPage } from 'next';

import { featureFlags } from '@v2/constants/feature-flags';
import { AcgihRiskCorrelationPage } from '@v2/pages/master/acgih-risk-correlation/AcgihRiskCorrelationPage';
import { RoutesEnum } from 'core/enums/routes.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { RoleEnum } from 'project/enum/roles.enums';

const AcgihRiskCorrelationRoute: NextPage = () => {
  return (
    <SContainer>
      <AcgihRiskCorrelationPage />
    </SContainer>
  );
};

export default AcgihRiskCorrelationRoute;

export const getServerSideProps = withSSRAuth(
  async () => {
    if (!featureFlags.acgihBeiRiskCorrelation) {
      return {
        redirect: { destination: RoutesEnum.DATABASE, permanent: false },
      };
    }

    return { props: {} };
  },
  {
    roles: [RoleEnum.MASTER],
  },
);
