import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import clone from 'clone';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';

import { useAuth } from 'core/contexts/AuthContext';
import { IUser } from 'core/interfaces/api/IUser';
import {
  IUpdateUser,
  useMutUpdateUser,
} from 'core/services/hooks/mutations/user/useMutUpdateUser';
import { userUpdateSchema } from 'core/utils/schemas/user-update.schema';

import { IProfessionalCouncil } from '../../../../../core/interfaces/api/IProfessional';

interface ISubmit extends Partial<IUpdateUser> {}

export const useUserFormOld = (onlyEdit?: boolean) => {
  const { user, refreshUser, googleSignLink } = useAuth();
  const { handleSubmit, control, setFocus, setValue } = useForm<any>({
    resolver: yupResolver(userUpdateSchema),
  });

  const [userData, setUserData] = useState({ ...createUser(user) });
  const [uneditable, setUneditable] = useState(onlyEdit ? false : true);

  useEffect(() => {
    if (user) {
      ['name', 'cpf', 'type'].forEach((key) => {
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
        councils: userData.councils,
        type:
          (userData.type as ProfessionalTypeEnum) || ProfessionalTypeEnum.USER,
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

  const onAddCouncil = (value: Partial<IProfessionalCouncil>) => {
    setUserData({
      ...userData,
      councils: [...(userData?.councils || []), value as any],
    });
  };

  const onEditCouncil = (
    value: Partial<IProfessionalCouncil>,
    index: number,
  ) => {
    const councils = clone(userData?.councils || []);
    councils[index] = { ...councils[index], ...value };

    setUserData({
      ...userData,
      councils: councils,
    });
  };

  const onDeleteCouncil = (value: Partial<IProfessionalCouncil>) => {
    setUserData({
      ...userData,
      councils: (userData?.councils || []).filter(
        (c) =>
          !(
            c.councilId === value.councilId &&
            c.councilType === value.councilType &&
            c.councilUF === value.councilUF
          ),
      ),
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
    setValue,
    onAddCouncil,
    onDeleteCouncil,
    onEditCouncil,
  };
};

const createUser = (user: Partial<IUser> | null) => {
  return {
    name: user?.name || '',
    email: user?.email || '',
    cpf: user?.cpf || '',
    type: user?.type || '',
    councilType: user?.councilType || '',
    councilUF: user?.councilUF || '',
    councilId: user?.councilId || '',
    formation: user?.formation || [],
    certifications: user?.certifications || [],
    hasCouncil: user?.councils && user?.councils.length > 0,
    councils: user?.councils,
    hasFormation: false,
    hasCertifications: false,
  };
};

export type IUseEditWorkspace = ReturnType<typeof useUserFormOld>;
