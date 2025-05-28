import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { OsForm } from 'components/organisms/forms/OsForm';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Page: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'OS'} />
      <SContainer>
        <OsForm />
      </SContainer>
    </>
  );
};

export default Page;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
