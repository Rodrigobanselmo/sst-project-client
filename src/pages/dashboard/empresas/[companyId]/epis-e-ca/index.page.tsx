import { SContainer } from 'components/atoms/SContainer';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { EpisAndCaTable } from 'components/organisms/tables/EpisAndCaTable/EpisAndCaTable';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const EpisAndCaPage: NextPage = () => {
  return (
    <>
      <SHeaderTag title={'EPIs e CA'} />
      <SContainer>
        <EpisAndCaTable />
      </SContainer>
    </>
  );
};

export default EpisAndCaPage;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
