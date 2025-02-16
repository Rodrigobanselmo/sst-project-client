import { NextPage } from 'next';

import { DocumentViewPage } from '@v2/pages/companies/documents/pages/document-view/document-view.page';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return <DocumentViewPage />;
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
