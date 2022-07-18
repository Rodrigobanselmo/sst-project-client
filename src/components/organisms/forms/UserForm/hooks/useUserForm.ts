import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup';

import { useAuth } from 'core/contexts/AuthContext';
import { IUser } from 'core/interfaces/api/IUser';
import {
  IUpdateUser,
  useMutUpdateUser,
} from 'core/services/hooks/mutations/manager/useMutUpdateUser';
import { userUpdateSchema } from 'core/utils/schemas/user-update.schema';

interface ISubmit extends Partial<IUpdateUser> {}

export const useUserForm = (onlyEdit?: boolean) => {
  const { user, refreshUser, googleSignLink } = useAuth();
  const { handleSubmit, control, setFocus, setValue } = useForm({
    resolver: yupResolver(userUpdateSchema),
  });

  const [userData, setUserData] = useState({ ...createUser(user) });
  const [uneditable, setUneditable] = useState(onlyEdit ? false : true);

  useEffect(() => {
    if (user) {
      ['crea', 'name', 'cpf'].forEach((key) => {
        const keyValue = key as unknown as keyof typeof user;
        if (!!user && user[keyValue]) setValue(key, user[keyValue]);
      });

      setUserData({
        ...userData,
        ...createUser(user),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateMutation = useMutUpdateUser();

  const onSave: SubmitHandler<ISubmit> = async (data) => {
    await updateMutation
      .mutateAsync({
        formation: userData.formation,
        certifications: userData.certifications,
        crea: userData.crea,
        ...data,
      })
      .then(() => {
        setUneditable(true);
        refreshUser();
        return true;
      })
      .catch(() => {});
  };

  const onEdit = (bool?: boolean) => {
    if (onlyEdit) return;
    if (typeof bool == 'boolean') return setUneditable(bool);

    if (uneditable) {
      setUneditable(false);

      setTimeout(() => {
        setFocus('name');
      }, 100);
      return;
    }

    setUserData({
      ...userData,
      ...createUser(user),
    });
    setUneditable(true);
  };

  const onAddArray = (value: string, type: 'formation' | 'certifications') => {
    setUserData({
      ...userData,
      [type]: [...(userData as any)[type], value],
    });
  };

  const onDeleteArray = (
    value: string,
    type: 'formation' | 'certifications',
  ) => {
    setUserData({
      ...userData,
      [type]: [
        ...(userData as any)[type].filter((item: string) => item !== value),
      ],
    });
  };

  const linkGoogle = async () => {
    const result = await googleSignLink();
    if (result) {
      console.log(result.user);
      await updateMutation
        .mutateAsync({ googleExternalId: result.user.uid })
        .then(() => {
          refreshUser();
          return true;
        })
        .catch(() => {});
    }
  };

  return {
    loading: updateMutation.isLoading,
    control,
    handleSubmit,
    onSave,
    uneditable,
    setUneditable,
    onEdit,
    userData,
    user,
    setUserData,
    onAddArray,
    onDeleteArray,
    linkGoogle,
  };
};

const createUser = (user: Partial<IUser> | null) => {
  return {
    name: user?.name || '',
    email: user?.email || '',
    crea: user?.crea || '',
    cpf: user?.cpf || '',
    formation: user?.formation || [''],
    certifications: user?.certifications || [''],
    hasCREA: !!user?.crea,
    hasFormation: true,
    hasCertifications: true,
  };
};

export type IUseEditWorkspace = ReturnType<typeof useUserForm>;
