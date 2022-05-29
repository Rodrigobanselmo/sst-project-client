import { Box } from '@mui/material';
import { NextPage } from 'next';

import { withSSRNoTeam } from 'core/utils/auth/withSSRNoTeam';

const OnboardingCompany: NextPage = () => {
  return (
    <Box>
      <p> </p>
    </Box>
  );
};

export default OnboardingCompany;

export const getServerSideProps = withSSRNoTeam(async () => {
  return {
    props: {},
  };
});
