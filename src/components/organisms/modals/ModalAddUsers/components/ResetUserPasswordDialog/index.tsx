import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Dialog, IconButton, InputAdornment } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';
import {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import * as Yup from 'yup';

import { useMutAdminResetPassword } from 'core/services/hooks/mutations/user/useMutAdminResetPassword';

const resetPasswordSchema = Yup.object().shape({
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

interface IResetUserPasswordDialog {
  open: boolean;
  onClose: () => void;
  userId?: number;
  companyId?: string;
}

export const ResetUserPasswordDialog = ({
  open,
  onClose,
  userId,
  companyId,
}: IResetUserPasswordDialog) => {
  const [showPassword, setShowPassword] = useState(false);
  const mutation = useMutAdminResetPassword();
  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      passwordConfirmation: '',
    },
  });

  const clearAndClose = () => {
    reset({ password: '', passwordConfirmation: '' });
    setShowPassword(false);
    onClose();
  };

  const onConfirm = handleSubmit(async (data) => {
    if (!userId || !companyId) return;

    await mutation.mutateAsync({
      companyId,
      id: userId,
      password: data.password,
    });

    reset({ password: '', passwordConfirmation: '' });
    setShowPassword(false);
    onClose();
  });

  return (
    <Dialog open={open} onClose={clearAndClose} maxWidth="xs" fullWidth>
      <SModalPaper p={8} minWidth={['100%', 420]}>
        <SModalHeader
          tag="edit"
          onClose={clearAndClose}
          title="Redefinir senha"
        />
        <SFlex direction="column" gap={8} mt={8}>
          <InputForm
            label="Senha provisória"
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
        <SModalButtons
          onClose={clearAndClose}
          loading={mutation.isLoading}
          buttons={[
            { type: 'button', text: 'Cancelar' },
            {
              text: 'Confirmar redefinição',
              variant: 'contained',
              type: 'button',
              onClick: onConfirm,
              disabled: mutation.isLoading || !userId || !companyId,
            },
          ]}
        />
      </SModalPaper>
    </Dialog>
  );
};
