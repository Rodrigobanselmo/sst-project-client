import { Typography } from '@mui/material';
import { NextPage } from 'next';

import { SLogo } from '../../components/atoms/SLogo';
import { brandNameConstant } from '../../core/constants/brand.constant';
import { LoginForm } from '../login/LoginForm';
import { STContainer, STSectionBox } from './index.styles';

const Home: NextPage = () => {
  return (
    <STContainer sx={{ p: [10], gap: 10 }}>
      <STSectionBox component="section">
        <SLogo />
        <Typography
          color={'text.light'}
          variant="h5"
          fontSize={['1rem', '1.25rem']}
          fontWeight="500"
        >
          Bem vindo a <br />
          <Typography variant="h1" component="p" fontSize={['2rem', '3rem']}>
            {brandNameConstant}
          </Typography>
        </Typography>

        <LoginForm />
      </STSectionBox>

      <STSectionBox
        component="section"
        display={['none', 'flex']}
      ></STSectionBox>
    </STContainer>
  );
};

export default Home;
