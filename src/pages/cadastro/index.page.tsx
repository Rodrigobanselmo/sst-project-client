import { useEffect, useRef } from 'react';

import { Typography } from '@mui/material';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';

import { useAuth } from 'core/contexts/AuthContext';
import { RoutesEnum } from 'core/enums/routes.enums';
import { withSSRGuest } from 'core/utils/auth/withSSRGuest';

import { SLogo } from '../../components/atoms/SLogo';
import { brandNameConstant } from '../../core/constants/brand.constant';
import { LoginForm } from './components/SignForm';
import { STContainer, STSectionBox } from './index.styles';

const Home: NextPage = () => {
  const { user, signOut } = useAuth();
  const { push, query } = useRouter();
  const inviteToken = query.token as string | undefined;
  const clearedInviteSessionRef = useRef(false);

  useEffect(() => {
    if (!inviteToken || clearedInviteSessionRef.current) return;

    const hasSession = !!parseCookies()['nextauth.token'] || !!user?.id;
    if (!hasSession) return;

    clearedInviteSessionRef.current = true;
    void signOut({ redirect: false });
  }, [inviteToken, signOut, user?.id]);

  useEffect(() => {
    if (inviteToken) return;

    if (user) {
      push(RoutesEnum.DASHBOARD);
    }
  }, [push, inviteToken, user]);

  return (
    <>
      <SHeaderTag hideInitial title={'Cadastro'} />
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
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<any>> => {
  if (ctx.query.token) {
    return { props: {} };
  }

  return withSSRGuest(async () => ({
    props: {},
  }))(ctx);
};
