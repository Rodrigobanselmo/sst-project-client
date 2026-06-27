import { SContainer } from 'components/atoms/SContainer';
import { NextPage } from 'next';

import { featureFlags } from '@v2/constants/feature-flags';
import { AcgihBeiIndicatorListPage } from '@v2/pages/master/acgih-bei-indicators/AcgihBeiIndicatorListPage';
import { RoutesEnum } from 'core/enums/routes.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { RoleEnum } from 'project/enum/roles.enums';

const AcgihBeiIndicatorsRoute: NextPage = () => {
  return (
    <SContainer>
      <AcgihBeiIndicatorListPage />
    </SContainer>
  );
};

export default AcgihBeiIndicatorsRoute;

export const getServerSideProps = withSSRAuth(
  async () => {
    if (!featureFlags.acgihBeiIndicators) {
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
