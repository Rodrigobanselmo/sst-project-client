import { Typography } from '@mui/material';
import { NextPage } from 'next';

import { SLogo } from '../components/atoms/SLogo';
import { brandNameConstant } from '../core/constants/brand.constant';
import { SContainer, SSectionBox } from './index/index.styled';
import { LoginForm } from './index/LoginForm';

const Home: NextPage = () => {
  return (
    <SContainer sx={{ p: [10], gap: 10 }}>
      <SSectionBox component="section">
        <SLogo />
        <Typography
          color={'text.light'}
          variant="h5"
          fontSize={['1rem', '1.25rem']}
          fontWeight="500"
        >
          Bem vindo a <br />
          <Typography variant="h1" fontSize={['2rem', '3rem']}>
            {brandNameConstant}
          </Typography>
        </Typography>

        <LoginForm />
      </SSectionBox>

      <SSectionBox component="section" display={['none', 'flex']}></SSectionBox>
    </SContainer>
  );
};

export default Home;
