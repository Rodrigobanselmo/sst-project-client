import { FC, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { Box, Link, Typography, useTheme } from '@mui/material';
import { GoogleButton } from 'components/atoms/SSocialButton/GoogleButton/GoogleButton';
import NextLink from 'next/link';
import * as Yup from 'yup';

import { useAuth } from 'core/contexts/AuthContext';
import { useOnlineStatus } from 'core/hooks/useOnlineStatus';

import { SButton } from '../../../../components/atoms/SButton';
import { InputForm } from '../../../../components/molecules/form/input';
import { brandIdentityButtonSx } from '../../../../configs/theme/brand-identity-fill';
import { useMutationLogin } from '../../../../core/services/hooks/mutations/auth/useMutationLogin';
import {
  ILoginSchema,
  loginSchema,
} from '../../../../core/utils/schemas/login.schema';
import { STForgotButton } from './styles';
import { useMutResetEmailPass } from 'core/services/hooks/mutations/user/useMutResetEmailPass';
import { useModal } from 'core/hooks/useModal';
import { ModalEnum } from 'core/enums/modal.enums';
import {
  ModalSingleInput,
  TypeInputModal,
  initialInputModalState,
} from 'components/organisms/modals/ModalSingleInput';

const ReCAPTCHAComp = ReCAPTCHA as any;

export const LoginForm: FC = () => {
  const { handleSubmit, control, watch, setValue } = useForm<any>({
    resolver: yupResolver(Yup.object().shape({ ...loginSchema })),
  });

  const { isLocal } = useOnlineStatus();
  const { onStackOpenModal } = useModal();

  const { mutate, isLoading } = useMutationLogin();
  const resetMutation = useMutResetEmailPass();
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(isLocal || false);

  const email = watch('email');

  const onSubmit: SubmitHandler<ILoginSchema> = async (data) => {
    mutate(data);
  };

  function onRecaptchaChange(value: string | null) {
    setIsCaptchaVerified(!!value);
  }
  const { googleSignIn } = useAuth();
  const recaptchaTheme = useTheme().palette.mode === 'dark' ? 'dark' : 'light';

  const handleGoogleSignIn = () => {
    googleSignIn();
  };

  const handleForgetPass = () => {
    onStackOpenModal(ModalEnum.SINGLE_INPUT, {
      onConfirm: async (newValue: string) => {
        await resetMutation.mutateAsync({ email: newValue });
      },
      placeholder: 'email@simplesst.com',
      label: 'Email',
      type: TypeInputModal.EMAIL,
      name: email,
      title: 'Recuperar senha',
      semiFullScreen: false,
    } as typeof initialInputModalState);
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={(handleSubmit as any)(onSubmit)}
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <InputForm
          sx={{ mb: [8, 12] }}
          setValue={setValue}
          label="E-mail"
          placeholder="email@empresa.com.br"
          control={control}
          type="email"
          name="email"
          inputProps={{
            id: 'input_email',
          }}
        />
        <InputForm
          setValue={setValue}
          inputProps={{
            id: 'input_password',
          }}
          label="Senha"
          placeholder="********"
          type="password"
          control={control}
          name="password"
        />
        <STForgotButton
          type="button"
          variant="text"
          size="small"
          disableTouchRipple
          onClick={() => handleForgetPass()}
        >
          Esqueceu sua senha?
        </STForgotButton>
        <Box
          sx={{
            mt: 10,
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '100%',
            transformOrigin: 'center center',
            minHeight: 78,
            '@media (max-width: 380px)': {
              transform: 'scale(0.86)',
              minHeight: 66,
            },
          }}
        >
          <ReCAPTCHAComp
            sitekey="6Lc7Bu4pAAAAAKDIuEI3EWCamZ5p6GLEjihAMuPI"
            theme={recaptchaTheme}
            onChange={onRecaptchaChange}
          />
        </Box>
        <SButton
          disabled={!isCaptchaVerified}
          loading={isLoading}
          type="submit"
          sx={{
            width: '100%',
            mt: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            ...brandIdentityButtonSx,
            '&.Mui-disabled': {
              color: 'text.disabled',
              backgroundColor: 'action.disabledBackground',
            },
          }}
        >
          ENTRAR
        </SButton>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            mt: 8,
            mb: 2,
          }}
        >
          <Box
            sx={{
              flex: 1,
              height: '1px',
              bgcolor: 'background.divider',
            }}
          />
          <Typography variant="caption" color="text.light">
            ou
          </Typography>
          <Box
            sx={{
              flex: 1,
              height: '1px',
              bgcolor: 'background.divider',
            }}
          />
        </Box>
        <GoogleButton
          onClick={handleGoogleSignIn}
          text="Entrar com Google"
          sx={{
            width: '100%',
            maxWidth: '100%',
            minWidth: '100%',
            mt: 6,
          }}
        />
        <Typography color="text.medium" variant="caption" align="center" mt={8}>
          Não possui conta?
          <NextLink href="/cadastro" passHref>
            <Link pl={2} underline="hover" color="primary.main" fontWeight={600}>
              Cadastre-se
            </Link>
          </NextLink>
        </Typography>
      </Box>
      <ModalSingleInput />
    </>
  );
};
