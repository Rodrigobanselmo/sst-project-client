import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';
import { FormsPage } from '@v2/pages/companies/forms/forms.page';

const Page: NextPage = () => {
  return <FormsPage />;
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
