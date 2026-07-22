import { SContainer } from 'components/atoms/SContainer';
import { NextPage } from 'next';

import { FrpsExplainabilityLibraryPage } from '@v2/pages/master/frps-explainability-library/FrpsExplainabilityLibraryPage';
import { RoleEnum } from 'project/enum/roles.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const FrpsExplainabilityLibraryRoute: NextPage = () => {
  return (
    <SContainer>
      <FrpsExplainabilityLibraryPage />
    </SContainer>
  );
};

export default FrpsExplainabilityLibraryRoute;

export const getServerSideProps = withSSRAuth(async () => ({ props: {} }), {
  roles: [RoleEnum.MASTER],
});
