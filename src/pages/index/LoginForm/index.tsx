import { FC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { isValidEmail } from '@brazilian-utils/brazilian-utils';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { Box, Link, Typography } from '@mui/material';
import NextLink from 'next/link';
import * as Yup from 'yup';

import { SButton } from '../../../components/atoms/SButton';
import { InputForm } from '../../../components/form/input';
import { loginSchema } from '../../../core/utils/schemas/login.schema';

export const LoginForm: FC = () => {
  const { handleSubmit, control, watch } = useForm({
    resolver: yupResolver(Yup.object().shape({ ...loginSchema })),
  });

  const password = watch('password');
  const email = watch('email');

  const successEmail = email && email.length > 3 && isValidEmail(email);
  const successPass = password && password.length > 7;

  const onSubmit: SubmitHandler<typeof loginSchema> = (data) =>
    console.log(data);

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
        sx={{ mb: [8, 12] }}
        label="E-mail"
        placeholder="email@gmail.com"
        control={control}
        type="email"
        name="email"
        success={successEmail}
      />
      <InputForm
        label="Senha"
        placeholder="********"
        type="password"
        control={control}
        name="password"
        success={successPass}
      />
      <SButton
        type="button"
        variant="text"
        size="small"
        disableTouchRipple
        sx={{
          mt: 3,
          color: 'secondary.main',
          marginLeft: 'auto',
          fontSize: '0.75rem',
          textTransform: 'none',
        }}
      >
        Esqueceu sua senha ?
      </SButton>
      <SButton type="submit" sx={{ width: '100%', mt: 12 }}>
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
      <SButton
        type="button"
        variant="text"
        size="small"
        disableTouchRipple
        sx={{
          color: 'secondary.main',
          marginLeft: 'auto',
          fontSize: '0.725rem',
          textTransform: 'none',
        }}
      ></SButton>
    </Box>
  );
};
