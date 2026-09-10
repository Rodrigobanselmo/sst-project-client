import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { IconButton, InputAdornment, Typography } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { SHeaderTag } from 'components/atoms/SHeaderTag/SHeaderTag';
import { SimpleSstWordmark, SLogo } from 'components/atoms/SLogo';
import { InputForm } from 'components/molecules/form/input';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import * as Yup from 'yup';

import { useAuth } from 'core/contexts/AuthContext';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useMutUpdateUser } from 'core/services/hooks/mutations/user/useMutUpdateUser';
import { withSSRAuth } from 'core/utils/auth/withSSRAuth';

import { STContainer, STSectionBox } from '../usuario/index.styles';

const changePasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'senha deve conter no mínimo 8 characteres')
    .max(20, 'senha deve conter no máximo 20 characteres')
    .required('Campo obrigatório'),
  passwordConfirmation: Yup.string()
    .oneOf(
      [Yup.ref('password'), null as unknown as any],
      'As senhas devem ser iguais',
    )
    .required('Campo obrigatório'),
});

const ChangeRequiredPasswordPage: NextPage = () => {
  const { user, signOut, refreshUser } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const updateUser = useMutUpdateUser({
    successMessage: 'Senha alterada com sucesso',
  });
  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      password: '',
      passwordConfirmation: '',
    },
  });

  useEffect(() => {
    if (user && user.mustChangePassword === false) {
      router.replace(RoutesEnum.DASHBOARD);
    }
  }, [router, user]);

  const onSubmit = handleSubmit(async (data) => {
    await updateUser.mutateAsync({
      password: data.password,
    });
    reset({ password: '', passwordConfirmation: '' });
    setShowPassword(false);
    await refreshUser();
    router.replace(RoutesEnum.DASHBOARD);
  });

  return (
    <>
      <SHeaderTag hideInitial title={'Definir nova senha - SIMPLESST'} />
      <STContainer sx={{ p: [10], px: [10, 20, 30, 40], gap: 10 }}>
        <STSectionBox component="section">
          <SLogo />
          <Typography
            color="text.medium"
            mt={10}
            mb={8}
            variant="h5"
            fontSize={['1rem', '1.25rem']}
            fontWeight="500"
          >
            Defina uma nova senha
            <Typography variant="h1" component="p" fontSize={['2rem', '3rem']}>
              <SimpleSstWordmark fontSize="inherit" fontWeight="inherit" />
            </Typography>
          </Typography>
          <Typography fontSize={14} color="text.label" mb={10}>
            Sua senha provisória precisa ser trocada antes de continuar.
          </Typography>
          <SFlex direction="column" gap={8} maxWidth={420}>
            <InputForm
              label="Nova senha"
              name="password"
              control={control}
              setValue={setValue}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="********"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="mostrar ou ocultar senha"
                      onClick={() => setShowPassword((value) => !value)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <InputForm
              label="Confirmar senha"
              name="passwordConfirmation"
              control={control}
              setValue={setValue}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="********"
            />
          </SFlex>
          <SFlex gap={5} mt={10} justifyContent="flex-end" width="100%">
            <SButton
              size="small"
              variant="outlined"
              type="button"
              onClick={() => signOut()}
            >
              Sair
            </SButton>
            <SButton
              size="small"
              variant="contained"
              loading={updateUser.isLoading}
              type="button"
              onClick={onSubmit}
            >
              Salvar
            </SButton>
          </SFlex>
        </STSectionBox>
        <STSectionBox component="section" display={['none', 'flex']} />
      </STContainer>
    </>
  );
};

export default ChangeRequiredPasswordPage;

export const getServerSideProps = withSSRAuth(
  async () => {
    return {
      props: {},
    };
  },
  { skipCompanyCheck: true },
);
