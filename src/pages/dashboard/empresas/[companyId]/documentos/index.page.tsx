import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { ActionPlanPage } from '@v2/pages/companies/action-plan/action-plan.page';
import { DocumentsPage } from '@v2/pages/companies/documents/documents.page';

const Page: NextPage = () => {
  return <DocumentsPage />;
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
