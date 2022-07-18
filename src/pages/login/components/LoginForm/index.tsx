import { FC, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { SubmitHandler, useForm } from 'react-hook-form';

import { isValidEmail } from '@brazilian-utils/brazilian-utils';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { Box, Link, Typography } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { GoogleButton } from 'components/atoms/SSocialButton/GoogleButton/GoogleButton';
import NextLink from 'next/link';
import * as Yup from 'yup';

import { useAuth } from 'core/contexts/AuthContext';

import { SButton } from '../../../../components/atoms/SButton';
import { InputForm } from '../../../../components/molecules/form/input';
import { useMutationLogin } from '../../../../core/services/hooks/mutations/useMutationLogin';
import {
  ILoginSchema,
  loginSchema,
} from '../../../../core/utils/schemas/login.schema';
import { STForgotButton } from './styles';

export const LoginForm: FC = () => {
  const { handleSubmit, control, watch } = useForm({
    resolver: yupResolver(Yup.object().shape({ ...loginSchema })),
  });

  const { mutate, isLoading } = useMutationLogin();
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  const password = watch('password');
  const email = watch('email');

  const successEmail = email && email.length > 3 && isValidEmail(email);
  const successPass = password && password.length > 7;

  const onSubmit: SubmitHandler<ILoginSchema> = async (data) => {
    mutate(data);
  };

  function onRecaptchaChange(value: string | null) {
    setIsCaptchaVerified(!!value);
  }
  const { googleSignIn } = useAuth();

  const handleGoogleSignIn = () => {
    googleSignIn();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <InputForm
        // defaultValue="admin@simple.com"
        sx={{ mb: [8, 12] }}
        label="E-mail"
        placeholder="email@gmail.com"
        control={control}
        type="email"
        name="email"
        success={successEmail}
      />
      <InputForm
        // defaultValue="aaaa0123"
        label="Senha"
        placeholder="********"
        type="password"
        control={control}
        name="password"
        success={successPass}
      />
      <STForgotButton
        type="button"
        variant="text"
        size="small"
        disableTouchRipple
      >
        Esqueceu sua senha ?
      </STForgotButton>
      <SFlex mt={10} center>
        <ReCAPTCHA
          sitekey="6Lew7PEgAAAAAOCJHR6jppNhmw8WEaoaEXWeGBEH"
          onChange={onRecaptchaChange}
        />
      </SFlex>
      <SButton
        disabled={!isCaptchaVerified}
        loading={isLoading}
        type="submit"
        sx={{ width: '100%', mt: 12 }}
      >
        ENTRAR
      </SButton>
      <Typography color="text.light" variant="caption" align="center" mt={4}>
        Nào possui conta?
        <NextLink href="/cadastro" passHref>
          <Link pl={2} underline="hover">
            Cadastre-se
          </Link>
        </NextLink>
      </Typography>

      <SFlex gap={5} mt={10} center width="100%">
        <GoogleButton onClick={handleGoogleSignIn} text="Entrar com Google" />
      </SFlex>
    </Box>
  );
};
