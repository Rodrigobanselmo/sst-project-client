import { NextPage } from 'next';

import { FormViewPage } from '@v2/pages/companies/forms/pages/form-view/form-view.page';
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
