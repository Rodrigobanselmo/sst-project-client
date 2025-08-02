import { NextPage } from 'next';

import { FormViewPage } from '@v2/pages/companies/forms/pages/application/pages/view/form-application-view.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return <FormViewPage />;
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
