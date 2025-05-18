import { NextPage } from 'next';

import { DocumentsPage } from '@v2/pages/companies/documents/documents.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return <DocumentsPage />;
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
