import { SContainer } from 'components/atoms/SContainer';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { BiologicalIndicatorDetailPage } from '@v2/pages/master/biological-indicators/BiologicalIndicatorDetailPage';
import { RoleEnum } from 'project/enum/roles.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const BiologicalIndicatorDetailRoute: NextPage = () => {
  const router = useRouter();
  const id = router.query.id as string;

  return (
    <SContainer>
      {id ? <BiologicalIndicatorDetailPage indicatorId={id} /> : null}
    </SContainer>
  );
};

export default BiologicalIndicatorDetailRoute;

export const getServerSideProps = withSSRAuth(async () => ({ props: {} }), {
  roles: [RoleEnum.MASTER],
});
