import { NextPage } from 'next';

import { FormConsolidatedViewPage } from '@v2/pages/companies/forms/pages/consolidated/form-consolidated-view.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return <FormConsolidatedViewPage />;
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
