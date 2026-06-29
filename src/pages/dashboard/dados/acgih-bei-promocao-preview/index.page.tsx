import { SContainer } from 'components/atoms/SContainer';
import { NextPage } from 'next';

import { featureFlags } from '@v2/constants/feature-flags';
import { AcgihPromotionPreviewPage } from '@v2/pages/master/acgih-promotion-preview/AcgihPromotionPreviewPage';
import { RoutesEnum } from 'core/enums/routes.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { RoleEnum } from 'project/enum/roles.enums';

const AcgihPromotionPreviewRoute: NextPage = () => {
  return (
    <SContainer>
      <AcgihPromotionPreviewPage />
    </SContainer>
  );
};

export default AcgihPromotionPreviewRoute;

export const getServerSideProps = withSSRAuth(
  async () => {
    if (!featureFlags.acgihBeiPromotionPreview) {
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
