import { FC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { Box } from '@mui/material';

import { useMutUpdateUser } from 'core/services/hooks/mutations/user/useMutUpdateUser';
import { userUpdateSchema } from 'core/utils/schemas/user-update.schema';

import { SButton } from '../../../../../components/atoms/SButton';
import { InputForm } from '../../../../../components/molecules/form/input';
import { ILoginSchema } from '../../../../../core/utils/schemas/login.schema';

export const UserForm: FC = () => {
  const { handleSubmit, control, setValue } = useForm<any>({
    resolver: yupResolver(userUpdateSchema),
  });

  const { mutate, isLoading } = useMutUpdateUser();

  const onSubmit: SubmitHandler<ILoginSchema> = async (data) => {
    mutate(data);
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
        setValue={setValue}
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
