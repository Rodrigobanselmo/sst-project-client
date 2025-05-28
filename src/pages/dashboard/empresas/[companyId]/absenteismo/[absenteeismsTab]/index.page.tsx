import { NextPage } from 'next';

import { AbsenteeismsPage } from '@v2/pages/companies/absenteeisms/absenteeisms.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return <AbsenteeismsPage />;
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
