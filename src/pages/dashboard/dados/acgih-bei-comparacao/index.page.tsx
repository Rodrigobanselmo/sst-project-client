import { SContainer } from 'components/atoms/SContainer';
import { NextPage } from 'next';

import { featureFlags } from '@v2/constants/feature-flags';
import { AcgihBeiComparisonListPage } from '@v2/pages/master/acgih-bei-comparison/AcgihBeiComparisonListPage';
import { RoutesEnum } from 'core/enums/routes.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { RoleEnum } from 'project/enum/roles.enums';

const AcgihBeiComparisonRoute: NextPage = () => {
  return (
    <SContainer>
      <AcgihBeiComparisonListPage />
    </SContainer>
  );
};

export default AcgihBeiComparisonRoute;

export const getServerSideProps = withSSRAuth(
  async () => {
    if (!featureFlags.acgihBeiComparison) {
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
