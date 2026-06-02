import { SContainer } from 'components/atoms/SContainer';
import { NextPage } from 'next';

import { RiskCatalogEquivalencesPage } from '@v2/pages/master/risk-catalog-equivalences/RiskCatalogEquivalencesPage';
import { RoleEnum } from 'project/enum/roles.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const RiskCatalogEquivalencesRoute: NextPage = () => {
  return (
    <SContainer>
      <RiskCatalogEquivalencesPage />
    </SContainer>
  );
};

export default RiskCatalogEquivalencesRoute;

export const getServerSideProps = withSSRAuth(async () => ({ props: {} }), {
  roles: [RoleEnum.MASTER],
});
