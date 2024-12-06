import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { ActionPlanPage } from '@v2/pages/companies/action-plan/action-plan.page';

const Page: NextPage = () => {
  return <ActionPlanPage />;
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
