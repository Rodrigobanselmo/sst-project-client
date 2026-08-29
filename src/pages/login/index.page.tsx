import { Typography } from '@mui/material';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';

import { withSSRGuest } from 'core/utils/auth/withSSRGuest';

import { SimpleSstWordmark, SLogo } from '../../components/atoms/SLogo';
import { LoginForm } from './components/LoginForm';
import { STContainer, STSectionBox } from './index.styles';
import { PrivacyAndTerms } from './components/PrivacyAndTerms';

const Home: NextPage = () => {
  return (
    <>
      <SHeaderTag hideInitial title={'Login - SIMPLESST'} />
      <STContainer sx={{ p: [10], px: [10, 20, 30, 40], gap: 10 }}>
        <STSectionBox component="section">
          <SLogo />
          <Typography
            color="text.medium"
            variant="h5"
            fontSize={['1rem', '1.25rem']}
            fontWeight="500"
          >
            Bem vindo a <br />
            <Typography variant="h1" component="p" fontSize={['2rem', '3rem']}>
              <SimpleSstWordmark
                fontSize="inherit"
                fontWeight="inherit"
              />
            </Typography>
          </Typography>
          <LoginForm />
          <PrivacyAndTerms />
        </STSectionBox>
        <STSectionBox
          component="section"
          display={['none', 'flex']}
        ></STSectionBox>
      </STContainer>
    </>
  );
};

export default Home;

export const getServerSideProps = withSSRGuest(async () => {
  return {
    props: {},
  };
});
