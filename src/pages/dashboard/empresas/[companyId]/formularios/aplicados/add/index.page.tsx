import { NextPage } from 'next';

import { FormApplicationAddPage } from '@v2/pages/companies/forms/pages/application/add/form-application-add.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return <FormApplicationAddPage />;
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
