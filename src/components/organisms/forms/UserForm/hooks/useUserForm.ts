import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';

import { IUser } from 'core/interfaces/api/IUser';
import { useMutUpdateUser } from 'core/services/hooks/mutations/manager/useMutUpdateUser';
import { userUpdateSchema } from 'core/utils/schemas/user-update.schema';

interface ISubmit extends Partial<IUser> {}

export const useUserForm = () => {
  const { handleSubmit, control, setFocus, setValue } = useForm({
    resolver: yupResolver(userUpdateSchema),
  });

  const [uneditable, setUneditable] = useState(true);

  const updateMutation = useMutUpdateUser();

  const onSave: SubmitHandler<ISubmit> = async (data) => {
    const user = await updateMutation.mutateAsync({
      ...data,
    });

    Object.keys(data).forEach((key) => {
      const keyValue = key as unknown as keyof typeof user;
      if (user && user[keyValue]) setValue(key, keyValue);
    });
    setUneditable(true);
    return true;
  };

  const onEdit = () => {
    if (uneditable) {
      setUneditable(false);

      setTimeout(() => {
        setFocus('name');
      }, 100);
      return;
    }
    setUneditable(true);
  };

  return {
    loading: updateMutation.isLoading,
    control,
    handleSubmit,
    onSave,
    uneditable,
    setUneditable,
    onEdit,
  };
};

export type IUseEditWorkspace = ReturnType<typeof useUserForm>;
