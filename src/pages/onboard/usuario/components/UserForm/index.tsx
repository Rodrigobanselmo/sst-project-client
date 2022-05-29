import { FC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { Box } from '@mui/material';
import * as Yup from 'yup';

import { useMutUpdateUser } from 'core/services/hooks/mutations/company/useMutUpdateUser';
import { userUpdateSchema } from 'core/utils/schemas/user-update.schema';

import { SButton } from '../../../../../components/atoms/SButton';
import { InputForm } from '../../../../../components/molecules/form/input';
import { ILoginSchema } from '../../../../../core/utils/schemas/login.schema';

export const UserForm: FC = () => {
  const { handleSubmit, control } = useForm({
    resolver: yupResolver(userUpdateSchema),
  });

  const { mutate, isLoading } = useMutUpdateUser();

  const onSubmit: SubmitHandler<ILoginSchema> = async (data) => {
    mutate(data);
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
        sx={{
          mb: [8, 12],
          input: {
            textTransform: 'uppercase',
            '&::placeholder': {
              textTransform: 'none',
            },
          },
        }}
        label="Nome completo"
        placeholder="Digite seu nome completo..."
        control={control}
        type="name"
        name="name"
      />
      <SButton loading={isLoading} type="submit" sx={{ width: '100%', mt: 12 }}>
        Prosseguir
      </SButton>
    </Box>
  );
};
