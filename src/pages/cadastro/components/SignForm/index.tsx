import { useState, FC, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { SubmitHandler, useForm } from 'react-hook-form';

import { isValidEmail } from '@brazilian-utils/brazilian-utils';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { Box, Link, Typography } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import * as Yup from 'yup';

import { RoutesEnum } from 'core/enums/routes.enums';
import { useMutationSign } from 'core/services/hooks/mutations/auth/useMutationSign';
import { signSchema } from 'core/utils/schemas/sign.schema';

import { SButton } from '../../../../components/atoms/SButton';
import { InputForm } from '../../../../components/molecules/form/input';
import { ILoginSchema } from '../../../../core/utils/schemas/login.schema';
import { useAuth } from 'core/contexts/AuthContext';
import { GoogleButton } from 'components/atoms/SSocialButton/GoogleButton/GoogleButton';
import { PasswordInputs } from '../PasswordInputs/PasswordInputs';
import { useSnackbar } from 'notistack';

const ReCAPTCHAComp = ReCAPTCHA as any;

export const LoginForm: FC = () => {
  const formProps = useForm({
    resolver: yupResolver(Yup.object().shape({ ...signSchema })),
  });

  const { handleSubmit, control, setValue, watch, setError } = formProps;

  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const { mutate, isLoading } = useMutationSign();
  const { googleSignUp } = useAuth();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const email = watch('email');

  const successEmail = email && email.length > 3 && isValidEmail(email);

  const onSubmit: SubmitHandler<ILoginSchema> = async (data) => {
    if (!isCaptchaVerified)
      return enqueueSnackbar('Por favor, verifique o captcha', {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });

    const token = router.query?.token as string | undefined;
    mutate({ ...data, token });
  };

  const initEmail = router.query?.email as string | undefined;

  useEffect(() => {
    setValue('email', initEmail);
  }, [initEmail, router.query, setValue]);

  function onRecaptchaChange(value: string | null) {
    setIsCaptchaVerified(!!value);
  }

  const handleGoogleSignUp = () => {
    const token = router.query?.token as string | undefined;
    googleSignUp(token);
  };

  return (
    <Box
      component="form"
      onSubmit={(handleSubmit as any)(onSubmit)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <InputForm
        sx={{ mb: [8, 8] }}
        label="E-mail"
        defaultValue={initEmail || ''}
        placeholder="exemplo@simplesst.com"
        setValue={setValue}
        control={control}
        type="email"
        name="email"
        success={successEmail}
      />

      <PasswordInputs {...formProps} />
      <SFlex mt={10} center>
        <ReCAPTCHAComp
          sitekey="6Lew7PEgAAAAAOCJHR6jppNhmw8WEaoaEXWeGBEH"
          onChange={onRecaptchaChange}
        />
      </SFlex>
      <SButton
        // disabled={!isCaptchaVerified}
        loading={isLoading}
        type="submit"
        sx={{ width: '100%', mt: 12 }}
      >
        CRIAR
      </SButton>
      <Typography color="text.light" variant="caption" align="center" mt={4}>
        Já possui conta?
        <NextLink href={RoutesEnum.LOGIN} passHref>
          <Link pl={2} underline="hover">
            Entrar
          </Link>
        </NextLink>
      </Typography>
      <SFlex gap={5} mt={10} center width="100%">
        <GoogleButton
          onClick={handleGoogleSignUp}
          text="Cadastrar com Google"
        />
      </SFlex>
    </Box>
  );
};
