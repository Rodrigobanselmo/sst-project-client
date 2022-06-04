import { FC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { isValidEmail } from '@brazilian-utils/brazilian-utils';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { Box, Link, Typography } from '@mui/material';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import * as Yup from 'yup';

import { RoutesEnum } from 'core/enums/routes.enums';
import { useMutationSign } from 'core/services/hooks/mutations/useMutationSign';
import { signSchema } from 'core/utils/schemas/sign.schema';

import { SButton } from '../../../../components/atoms/SButton';
import { InputForm } from '../../../../components/molecules/form/input';
import { ILoginSchema } from '../../../../core/utils/schemas/login.schema';

export const LoginForm: FC = () => {
  const { handleSubmit, control, watch } = useForm({
    resolver: yupResolver(Yup.object().shape({ ...signSchema })),
  });

  const { mutate, isLoading } = useMutationSign();
  const router = useRouter();

  const password = watch('password');
  const passwordConfirmation = watch('passwordConfirmation');
  const email = watch('email');

  const successEmail = email && email.length > 3 && isValidEmail(email);
  const successPass = password && password.length > 7;
  const successConfirmationPass =
    successPass && passwordConfirmation === password;

  const onSubmit: SubmitHandler<ILoginSchema> = async (data) => {
    const token = router.query?.token as string | undefined;
    mutate({ ...data, token });
  };

  const initEmail = router.query?.email as string | undefined;

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
        sx={{ mb: [8, 8] }}
        label="E-mail"
        defaultValue={initEmail || ''}
        placeholder="email@gmail.com"
        control={control}
        type="email"
        name="email"
        success={successEmail}
      />
      <InputForm
        sx={{ mb: [8, 8] }}
        label="Senha"
        placeholder="********"
        type="password"
        autoComplete="off"
        control={control}
        name="password"
        success={successPass}
      />
      <InputForm
        label="Confirmar senha"
        placeholder="********"
        autoComplete="off"
        type="password"
        control={control}
        name="passwordConfirmation"
        success={successConfirmationPass}
      />
      <SButton loading={isLoading} type="submit" sx={{ width: '100%', mt: 12 }}>
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
    </Box>
  );
};
