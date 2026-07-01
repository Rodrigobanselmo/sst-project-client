import { SContainer } from 'components/atoms/SContainer';
import { NextPage } from 'next';

import { featureFlags } from '@v2/constants/feature-flags';
import { RiskSubTypeCurationPage } from '@v2/pages/master/risk-sub-type-curation/RiskSubTypeCurationPage';
import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskSubTypeCurationRoute: NextPage = () => {
  return (
    <SContainer>
      <RiskSubTypeCurationPage />
    </SContainer>
  );
};

export default RiskSubTypeCurationRoute;

export const getServerSideProps = withSSRAuth(
  async () => {
    if (!featureFlags.riskSubTypeCuration) {
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
