import { NextPage } from 'next';

import { FormModelEditPage } from '@v2/pages/companies/forms/pages/model/pages/edit/form-model-edit.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return <FormModelEditPage />;
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
