import { NextPage } from 'next';

import { FormModelAddPage } from '@v2/pages/companies/forms/pages/model/add/form-model-add.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return <FormModelAddPage />;
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
