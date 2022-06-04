import { useEffect } from 'react';

import { Typography } from '@mui/material';
import { SLogo } from 'components/atoms/SLogo';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { useAuth } from 'core/contexts/AuthContext';
import { RoutesEnum } from 'core/enums/routes.enums';
import { withSSRGuest } from 'core/utils/auth/withSSRGuest';

import { UserForm } from './components/UserForm';
import { STContainer, STSectionBox } from './index.styles';

const UserPage: NextPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.name) {
      router.push(RoutesEnum.ONBOARD_NO_TEAM);
    }
  }, [router, user]);

  return (
    <STContainer sx={{ p: [10], gap: 10 }}>
      <STSectionBox component="section">
        <SLogo mb={3} />
        <Typography
          color={'text.light'}
          variant="h5"
          fontSize={['1rem', '1.25rem']}
          fontWeight="500"
          mb={20}
        >
          <Typography component="p" fontSize={['1.2rem', '1.8rem']}>
            Informe seus dados
          </Typography>
        </Typography>

        <UserForm />
      </STSectionBox>
      <STSectionBox
        component="section"
        display={['none', 'flex']}
      ></STSectionBox>
    </STContainer>
  );
};

export default UserPage;

export const getServerSideProps = withSSRGuest(async () => {
  return {
    props: {},
  };
});
