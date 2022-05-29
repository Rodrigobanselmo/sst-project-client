import { BoxProps } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import SFlex from 'components/atoms/SFlex';
import { InputForm } from 'components/molecules/form/input';

import { useAuth } from 'core/contexts/AuthContext';
import { useFetchFeedback } from 'core/hooks/useFetchFeedback';

import { useUserForm } from './hooks/useUserForm';
import { STBox } from './styles';

export const UserForm = (props: BoxProps) => {
  const { user } = useAuth();
  const { onSave, loading, handleSubmit, control, uneditable, onEdit } =
    useUserForm();

  useFetchFeedback(!user);

  if (!user) return null;
  return (
    <STBox onSubmit={handleSubmit(onSave)} component={'form'} {...props}>
      <InputForm
        defaultValue={user?.name}
        uneditable={uneditable}
        label="Nome Completo"
        control={control}
        placeholder={'Digite seu nome completo'}
        name="name"
        size="small"
      />
      <SFlex gap={5} mt={10} justifyContent="flex-end" width="100%">
        <SButton
          size="small"
          variant={uneditable ? 'contained' : 'outlined'}
          loading={loading}
          onClick={onEdit}
        >
          {uneditable ? 'Editar' : 'Cancelar'}
        </SButton>
        <SButton
          size="small"
          variant={'contained'}
          loading={loading}
          type="submit"
          disabled={uneditable}
        >
          Salvar
        </SButton>
      </SFlex>
    </STBox>
  );
};
