import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { ActionPlanTable } from '@v2/pages/companies/action-plan/components/ActionPlanTable/ActionPlanTable';

const ActionPlanPage: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'Plano de Ação'} />
      <SContainer>
        <ActionPlanTable />
      </SContainer>
    </>
  );
};

export default ActionPlanPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
