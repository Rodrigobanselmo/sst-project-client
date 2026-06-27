import { SContainer } from 'components/atoms/SContainer';
import { NextPage } from 'next';

import { featureFlags } from '@v2/constants/feature-flags';
import { EsocialProcedureListPage } from '@v2/pages/master/esocial-procedures/EsocialProcedureListPage';
import { RoutesEnum } from 'core/enums/routes.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { RoleEnum } from 'project/enum/roles.enums';

const EsocialProceduresRoute: NextPage = () => {
  return (
    <SContainer>
      <EsocialProcedureListPage />
    </SContainer>
  );
};

export default EsocialProceduresRoute;

export const getServerSideProps = withSSRAuth(
  async () => {
    if (!featureFlags.esocialProcedureCuration) {
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
