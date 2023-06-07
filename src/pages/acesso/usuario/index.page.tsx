import { useEffect } from 'react';

import { Typography } from '@mui/material';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { SLogo } from 'components/atoms/SLogo';
import { UserForm } from 'components/organisms/forms/UserForm';
import { ModalAddCouncil } from 'components/organisms/modals/ModalAddCouncil';
import { ModalSingleInput } from 'components/organisms/modals/ModalSingleInput';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

import { useAuth } from 'core/contexts/AuthContext';
import { RoutesEnum } from 'core/enums/routes.enums';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

import { STContainer, STSectionBox } from './index.styles';

const UserPage: NextPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.name && user?.cpf) {
      router.push(RoutesEnum.ONBOARD_NO_TEAM);
    }
  }, [router, user]);

  return (
    <>
      <SHeaderTag hideInitial title={'Dados Perfil'} />
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

          <UserForm firstEdit />
        </STSectionBox>
        <ModalSingleInput />
        <ModalAddCouncil />
      </STContainer>
    </>
  );
};

export default UserPage;

export const getServerSideProps = withSSRAuth(
  async () => {
    return {
      props: {},
    };
  },
  { skipCompanyCheck: true },
);
