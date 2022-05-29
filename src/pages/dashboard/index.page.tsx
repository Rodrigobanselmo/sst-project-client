import { SContainer } from 'components/atoms/SContainer';
import SPageTitle from 'components/atoms/SPageTitle';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Home: NextPage = () => {
  return (
    <SContainer>
      <SPageTitle>Site em desenvolvimento</SPageTitle>
      <p>Novas atualizações em breve</p>
    </SContainer>
  );
};

export default Home;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
