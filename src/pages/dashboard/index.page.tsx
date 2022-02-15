import { Box } from '@mui/material';
import { NextPage } from 'next';

import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

const Home: NextPage = () => {
  return (
    <Box>
      <p> </p>
    </Box>
  );
};

export default Home;

export const getServerSideProps = withSSRAuth(async () => {
  return {
    props: {},
  };
});
