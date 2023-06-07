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
import * as Yup from 'yup';
import { IProfessionalCouncil } from './../../../../../core/interfaces/api/IProfessional';
import { oldPassSchema, signSchema } from 'core/utils/schemas/sign.schema';
import { useQueryUser } from 'core/services/hooks/queries/useQueryUser';
import { useRouter } from 'next/router';
import { queryClient } from 'core/services/queryClient';
import { QueryEnum } from 'core/enums/query.enums';
import { useMutUpdateUserAdmin } from 'core/services/hooks/mutations/user/useMutUpdateUserAdmin';

interface ISubmit extends Partial<IUpdateUser> {}

export const useUserForm = () => {
  const { user, refreshUser: refreshUserMain, googleSignLink } = useAuth();
  const { query } = useRouter();

  const { data: userFetch, isLoading } = useQueryUser({
    companyId: query?.companyId as string | undefined,
    userId: query?.userId ? Number(query?.userId) : undefined,
  });

  const formProps = useForm({
    resolver: yupResolver(userUpdateSchema),
  });

  const formPropsPass = useForm({
    resolver: yupResolver(
      Yup.object().shape({
        password: signSchema.password,
        passwordConfirmation: signSchema.passwordConfirmation,
        oldPassword: oldPassSchema.oldPassword,
      }),
    ),
  });

  const { handleSubmit, control, setValue } = formProps;

  const [userData, setUserData] = useState({} as ReturnType<typeof createUser>);

  useEffect(() => {
    const userFrom = query?.userId ? userFetch : user;

    if (userFrom) {
      setUserData({
        ...userData,
        ...createUser(userFrom),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userFetch, query?.userId]);

  const updateUserMutation = useMutUpdateUser();
  const updateUserAdminMutation = useMutUpdateUserAdmin();

  const updateMutation = query?.userId
    ? updateUserAdminMutation
    : updateUserMutation;

  const refreshUser = () => {
    refreshUserMain();
    if (query?.userId)
      queryClient.invalidateQueries([
        QueryEnum.USERS,
        userFetch?.companyId,
        userFetch?.id,
      ]);
  };

  const onSave: SubmitHandler<ISubmit> = async (data) => {
    await updateMutation
      .mutateAsync({
        formation: userData.formation,
        certifications: userData.certifications,
        councils: userData.councils,
        type:
          (userData.type as ProfessionalTypeEnum) || ProfessionalTypeEnum.USER,
        ...data,
        companyId: query?.companyId as string | undefined,
        id: query?.userId ? Number(query?.userId) : undefined,
      })
      .then(() => {
        refreshUser();
        return true;
      })
      .catch(() => {});
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
        .mutateAsync({
          googleExternalId: result.user.uid,
          googleUser: result.user.email || undefined,
        })
        .then(() => {
          refreshUser();
          return true;
        })
        .catch(() => {});
    }
  };

  const handleDeleteGoogleAccount = async () => {
    await updateMutation
      .mutateAsync({
        googleExternalId: null,
        googleUser: null,
      })
      .then(() => {
        refreshUser();
        return true;
      })
      .catch(() => {});
  };

  const handleChangePass = async () => {
    const isValid = await formPropsPass.trigger();
    if (!isValid) return;

    const password = formPropsPass.getValues('password');
    const oldPassword = formPropsPass.getValues('oldPassword');

    await updateMutation
      .mutateAsync({
        password,
        oldPassword,
        companyId: query?.companyId as string | undefined,
        id: query?.userId ? Number(query?.userId) : undefined,
      })
      .then(() => {
        refreshUser();
        formPropsPass.reset();
        return true;
      })
      .catch(() => {});
  };

  return {
    loading: updateMutation.isLoading,
    control,
    handleSubmit,
    onSave,
    userData,
    user: query?.userId ? userFetch : user,
    setUserData,
    onAddArray,
    onDeleteArray,
    linkGoogle,
    setValue,
    onAddCouncil,
    onDeleteCouncil,
    onEditCouncil,
    handleDeleteGoogleAccount,
    formProps: formPropsPass,
    handleChangePass,
    loadingPage: isLoading,
    isUserEditAdmin: !!query?.userId,
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

export type IUseEditWorkspace = ReturnType<typeof useUserForm>;
function trigger() {
  throw new Error('Function not implemented.');
}
