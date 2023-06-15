import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { NextPage } from 'next';

import * as Yup from 'yup';
import { withSSRGuest } from 'core/utils/auth/withSSRGuest';

import { STContainer, STSectionBox } from './index.styles';
import { SLogo } from 'components/atoms/SLogo';
import { Typography } from '@mui/material';
import { brandNameConstant } from 'core/constants/brand.constant';
import { PasswordInputs } from 'pages/cadastro/components/PasswordInputs/PasswordInputs';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { signSchema } from 'core/utils/schemas/sign.schema';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import SFlex from 'components/atoms/SFlex';
import { SButton } from 'components/atoms/SButton';
import { useMutResetPass } from 'core/services/hooks/mutations/user/useMutResetPass';

const Home: NextPage = () => {
  const formProps = useForm({
    resolver: yupResolver(
      Yup.object().shape({
        password: signSchema.password,
        passwordConfirmation: signSchema.passwordConfirmation,
      }),
    ),
  });

  const mutate = useMutResetPass();

  const { query } = useRouter();
  const token = query.token as string;

  const handleChangePass = async () => {
    const isValid = await formProps.trigger();
    if (!isValid) return;

    mutate.mutateAsync({
      tokenId: token,
      password: formProps.getValues('password'),
    });
  };

  return (
    <>
      <SHeaderTag hideInitial title={'Resetar senha - SIMPLESST'} />
      <STContainer sx={{ p: [10], px: [10, 20, 30, 40], gap: 10 }}>
        <STSectionBox component="section">
          <SLogo />
          <Typography
            color={'text.light'}
            mt={10}
            mb={20}
            variant="h5"
            fontSize={['1rem', '1.25rem']}
            fontWeight="500"
          >
            Resetar senha <br />
            <Typography variant="h1" component="p" fontSize={['2rem', '3rem']}>
              {brandNameConstant}
            </Typography>
          </Typography>
          <PasswordInputs resetPass {...formProps} />
          <SFlex gap={5} mt={10} justifyContent="flex-end" width="100%">
            <SButton
              size="small"
              variant={'contained'}
              loading={mutate.isLoading}
              type="button"
              onClick={handleChangePass}
            >
              Salvar
            </SButton>
          </SFlex>
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
